
import fetch from "node-fetch";

// The dotenv import is removed. Foundry's FFI automatically loads the .env file.
const API_BASE_URL = "https://trading.ai.zircuit.com/api/engine/v1";
const API_KEY = process.env.API_KEY;

// Common token addresses
const TOKENS = {
  USDC_MAINNET: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDC_BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 
  USDT_OPTIMISM: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  ETH_ADDRESS: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
};

const CHAINS = {
  ETHEREUM: 1,
  BASE: 8453,
  OPTIMISM: 10,
  ZIRCUIT: 48900
};

async function getQuote(options = {}) {
  try {
    if (!API_KEY) {
      throw new Error("API_KEY not found in environment variables. Ensure it is set in your .env file.");
    }

    // Default parameters - can be overridden
    const defaults = {
      srcChainId: CHAINS.BASE,
      srcToken: TOKENS.USDC_BASE,
      srcAmountWei: "5000000", // 5 USDC (6 decimals) to match the test case
      destToken: TOKENS.ETH_ADDRESS,
      destChainId: CHAINS.ZIRCUIT,
      slippageBps: 100, // 1%
      userAccount: "0x88F59F8826af5e695B13cA934d6c7999875A9EeA",
      destReceiver: "0x88F59F8826af5e695B13cA934d6c7999875A9EeA"
    };

    const quoteRequest = { ...defaults, ...options };

    // Log diagnostic info to stderr to avoid polluting the FFI output
    console.error("Request parameters sent to API:");
    console.error(JSON.stringify(quoteRequest, null, 2));

    const response = await fetch(`${API_BASE_URL}/order/estimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "User-Agent": "AIagentVault-Test/1.0"
      },
      body: JSON.stringify(quoteRequest),
      timeout: 30000 // 30 second timeout
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    if (!json.data || !json.data.tx) {
        console.error("Invalid response from API:", JSON.stringify(json, null, 2));
        throw new Error("Invalid response structure from API: missing data.tx");
    }

    const { tx } = json.data;
    
    if (!tx.to || !tx.data) {
      throw new Error("Invalid tx object in response: missing 'to' or 'data'");
    }

    let value = tx.value ? tx.value.toString() : "0";

    // Output ONLY the data needed by Solidity to stdout.
    // This must be the only thing printed to console.log.
    console.log(`${tx.to} ${tx.data} ${value}`);
    
  } catch (error) {
    // Log all errors to stderr
    console.error("❌ Script error:", error.message);
    process.exit(1);
  }
}

// Handle command line arguments for custom parameters
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    
    if (key && value) {
      // Convert numeric strings to numbers where appropriate
      if (['srcChainId', 'destChainId', 'slippageBps'].includes(key)) {
        options[key] = parseInt(value, 10);
      } else {
        options[key] = value;
      }
    }
  }
  
  return options;
}

// Run if called directly from the command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs();
  getQuote(options);
}

// Export for potential use in other JS modules
export { getQuote, TOKENS, CHAINS };
