import dotenv from "dotenv";
import { AgentKit } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { createHash } from "crypto";

// Load env vars from .env file
dotenv.config();

// Function to generate wallet secret and show what to save
function generateWalletSecret() {
  console.log("🔐 Generating deterministic wallet secret...");
  
  // Create a deterministic seed based on your API keys
  const apiKeyHash = createHash('sha256')
    .update(process.env.CDP_API_KEY_NAME.trim())
    .update(process.env.CDP_API_KEY_PRIVATE_KEY.trim())
    .digest();
  
  const walletSecret = apiKeyHash.toString('base64');
  
  console.log("\n" + "═".repeat(80));
  console.log("🔑 WALLET SECRET GENERATED!");
  console.log("═".repeat(80));
  console.log("");
  console.log("📝 ADD THIS TO YOUR .env FILE:");
  console.log("═".repeat(40));
  console.log(`CDP_WALLET_SECRET=${walletSecret}`);
  console.log("═".repeat(40));
  console.log("");
  console.log("💡 Copy the line above and paste it into your .env file");
  console.log("");
  
  return walletSecret;
}

async function main() {
  console.log("🚀 AgentKit Wallet Persistence (Secret-Based)\n");
  
  // Validate required environment variables first
  const requiredVars = ['CDP_API_KEY_NAME', 'CDP_API_KEY_PRIVATE_KEY', 'OPENAI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]?.trim());
  
  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log("\nPlease add these to your .env file first!");
    process.exit(1);
  }

  console.log("🔍 Environment Check:");
  console.log("CDP_API_KEY_NAME:", "✅ Set");
  console.log("CDP_API_KEY_PRIVATE_KEY:", "✅ Set");  
  console.log("OPENAI_API_KEY:", "✅ Set");
  
  // Check if we already have a wallet secret
  let walletSecret = process.env.CDP_WALLET_SECRET?.trim();
  
  if (!walletSecret) {
    console.log("CDP_WALLET_SECRET: ❌ Missing");
    walletSecret = generateWalletSecret();
    
    console.log("⚠️  Script will exit now. Please add the CDP_WALLET_SECRET to your .env file and run again.");
    process.exit(0);
  } else {
    console.log("CDP_WALLET_SECRET: ✅ Found");
  }
  
  console.log(`🔑 Using wallet secret (${walletSecret.length} chars)`);
  
  // Initialize AgentKit with the secret
  console.log("\n🚀 Initializing AgentKit with persistent wallet...");
  
  let agentKit;
  try {
    agentKit = await AgentKit.from({
      cdpApiKeyId: process.env.CDP_API_KEY_NAME.trim(),
      cdpApiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY.trim(),
      cdpWalletSecret: walletSecret,
    });
    console.log("✅ AgentKit initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize AgentKit:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Verify your CDP API credentials are correct");
    console.log("2. Check your internet connection");
    console.log("3. Try regenerating your wallet secret");
    process.exit(1);
  }
  
  // Get wallet address
  let currentAddress = null;
  try {
    currentAddress = await agentKit.getWalletAddress();
    console.log(`📍 Wallet address: ${currentAddress}`);
  } catch (e) {
    console.error("❌ Could not get wallet address:", e.message);
  }
  
  // Get tools and test wallet details
  const tools = await getLangChainTools(agentKit);
  console.log(`🛠️ Loaded ${tools.length} tools`);
  
  // Enhanced wallet details check
  try {
    const walletTool = tools.find(t => t.name === 'WalletActionProvider_get_wallet_details');
    if (walletTool) {
      console.log("\n💰 Getting detailed wallet info...");
      const details = await walletTool.func({});
      console.log("💰 Wallet details:");
      console.log(details);
      
      // Double-check address extraction
      const addressMatch = details.match(/Address:\s*(0x[a-fA-F0-9]{40})/i);
      if (addressMatch && !currentAddress) {
        currentAddress = addressMatch[1];
      }
    }
  } catch (error) {
    console.warn("⚠️ Could not get wallet details via tool:", error.message);
  }
  
  if (!currentAddress) {
    console.error("❌ CRITICAL: Could not determine wallet address!");
    process.exit(1);
  }
  
  // Track wallet persistence
  const trackingFile = '.wallet_persistence.json';
  let persistenceData = {
    runs: [],
    walletSecret: createHash('sha256').update(walletSecret).digest('hex').substring(0, 16) // Just a hash for tracking
  };
  
  if (existsSync(trackingFile)) {
    try {
      persistenceData = JSON.parse(readFileSync(trackingFile, 'utf8'));
      if (!Array.isArray(persistenceData.runs)) {
        persistenceData.runs = [];
      }
    } catch (e) {
      console.warn("⚠️ Could not read persistence tracking:", e.message);
    }
  }
  
  // Check if this is the same wallet as before
  const previousRun = persistenceData.runs.find(run => run.address === currentAddress);
  const isConsistentWallet = persistenceData.runs.length > 0 && 
                            persistenceData.runs.every(run => run.address === currentAddress);
  
  if (previousRun) {
    console.log("\n🎉 SUCCESS! WALLET REUSE CONFIRMED!");
    console.log(`✅ Same address as run from: ${previousRun.timestamp}`);
    console.log("🔄 Your wallet is persisting correctly!");
  } else if (persistenceData.runs.length > 0) {
    console.log("\n⚠️  WARNING: Different wallet address detected!");
    console.log("   This might indicate an issue with wallet persistence.");
  } else {
    console.log("\n🆕 First run with this wallet secret");
  }
  
  // Add current run
  persistenceData.runs.push({
    address: currentAddress,
    timestamp: new Date().toISOString(),
    secretHash: persistenceData.walletSecret
  });
  
  // Keep last 20 runs
  if (persistenceData.runs.length > 20) {
    persistenceData.runs = persistenceData.runs.slice(-20);
  }
  
  // Save tracking data
  try {
    writeFileSync(trackingFile, JSON.stringify(persistenceData, null, 2));
  } catch (e) {
    console.warn("⚠️ Could not save persistence tracking:", e.message);
  }
  
  // Show comprehensive statistics
  const uniqueAddresses = [...new Set(persistenceData.runs.map(r => r.address))];
  const totalRuns = persistenceData.runs.length;
  
  console.log("\n📊 Wallet Persistence Statistics:");
  console.log(`   Total runs tracked: ${totalRuns}`);
  console.log(`   Unique wallet addresses: ${uniqueAddresses.length}`);
  console.log(`   Current address: ${currentAddress}`);
  
  if (uniqueAddresses.length === 1 && totalRuns > 1) {
    console.log("   🎉 PERFECT CONSISTENCY! Same wallet every time!");
  } else if (uniqueAddresses.length > 1) {
    console.log("   ⚠️  Inconsistent addresses detected:");
    uniqueAddresses.forEach((addr, i) => {
      const count = persistenceData.runs.filter(r => r.address === addr).length;
      const isCurrent = addr === currentAddress;
      console.log(`      ${i+1}. ${addr} (${count} times)${isCurrent ? ' ← CURRENT' : ''}`);
    });
  }
  
  // Test agent functionality
  console.log("\n🤖 Testing agent...");
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini", 
    temperature: 0,
  });
  
  const agent = createReactAgent({
    llm,
    tools,
  });
  
  try {
    const result = await agent.invoke({
      messages: [{
        role: "user",
        content: "What is my wallet address and current balance? Be concise."
      }]
    });
    
    console.log("✅ Agent response:");
    console.log(result.messages[result.messages.length - 1].content);
  } catch (error) {
    console.warn("⚠️ Agent test failed:", error.message);
  }
  
  // Final status
  console.log("\n" + "═".repeat(70));
  if (isConsistentWallet || totalRuns === 1) {
    console.log("🎉 WALLET PERSISTENCE: WORKING PERFECTLY!");
    console.log(`   Your persistent wallet: ${currentAddress}`);
    console.log("   Run this script again to verify continued persistence.");
  } else {
    console.log("⚠️  WALLET PERSISTENCE: NEEDS ATTENTION");
    console.log("   Multiple wallet addresses detected in history.");
    console.log("   Check if your .env file or seed is being modified.");
  }
  console.log("═".repeat(70));
}

main().catch(err => {
  console.error("🔥 Fatal error:", err);
  process.exit(1);
});
