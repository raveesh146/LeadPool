const { ethers } = require("ethers");
const readline = require("readline");

// ====== USER INPUTS ======
const WS_URL = "wss://base-mainnet.g.alchemy.com/v2/XKkME-uEKeE12vDA5wjhm";
const CONTRACT_ADDRESS = "0x0792C46723d479D4C29De5D78D93C0146EdF3f5B";

// ABI fragment for ExecutionCompleted event
const ABI = [
	"event ExecutionCompleted(bytes32 indexed tradeId, address indexed adapter, address indexed userAccount, address srcToken, uint256 srcTokenAmount, uint256 destChainId, bytes32 destToken, uint256 destTokenMinAmount, bytes32 destReceiver)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",
];

const provider = new ethers.WebSocketProvider(WS_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Cache for token metadata
const tokenCache = new Map();

// Convert bytes32 token to possible address (if ERC-20)
function bytes32ToAddress(bytes32) {
	// If it's 0xeeee... treat as native ETH/BASE
	if (/^0x[eE]{40}$/.test("0x" + bytes32.slice(26))) {
		return "NATIVE";
	}
	return ethers.getAddress("0x" + bytes32.slice(26));
}

// Fetch decimals and symbol, cache results
async function getTokenInfo(tokenAddr) {
	if (tokenAddr === "NATIVE") {
		return { decimals: 18, symbol: "ETH" }; // BASE native token also 18 decimals
	}
	if (tokenCache.has(tokenAddr)) return tokenCache.get(tokenAddr);
	try {
		const token = new ethers.Contract(tokenAddr, ABI, provider);
		const [decimals, symbol] = await Promise.all([
			token.decimals(),
			token.symbol(),
		]);
		tokenCache.set(tokenAddr, { decimals, symbol });
		return { decimals, symbol };
	} catch {
		tokenCache.set(tokenAddr, { decimals: 18, symbol: tokenAddr });
		return { decimals: 18, symbol: tokenAddr };
	}
}

// Ask for Leader Adapter Address
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
rl.question("Enter Leader Adapter address: ", (leaderInput) => {
	const leaderAddr = ethers.getAddress(leaderInput.trim());

	console.log(
		`Listening for ExecutionCompleted from Leader: ${leaderAddr}...`
	);

	contract.on(
		"ExecutionCompleted",
		async (
			tradeId,
			adapter,
			userAccount,
			srcToken,
			srcAmount,
			destChainId,
			destToken,
			destAmount,
			destReceiver,
			event
		) => {
			if (adapter.toLowerCase() !== leaderAddr.toLowerCase()) return;

			// Resolve srcToken info
			const srcInfo = await getTokenInfo(srcToken);
			const formattedSrc = ethers.formatUnits(
				srcAmount,
				srcInfo.decimals
			);

			// Convert destToken bytes32 to address & resolve info
			const destTokenAddr = bytes32ToAddress(destToken);
			const destInfo = await getTokenInfo(destTokenAddr);
			const formattedDest = ethers.formatUnits(
				destAmount,
				destInfo.decimals
			);

			console.log("\n===== ExecutionCompleted =====");
			console.log("Src Token:", srcInfo.symbol, srcToken);
			console.log("Src Amount:", formattedSrc);
			console.log("Dest Token:", destInfo.symbol, destTokenAddr);
			console.log("Dest Amount:", formattedDest);
			console.log("Block:", event.blockNumber);
		}
	);
});
