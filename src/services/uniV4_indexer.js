import { ethers } from "ethers";
import { slice } from "viem";

import { config as dotenv } from "dotenv";
import {
	createWalletClient,
	http,
	getAddress,
	erc20Abi,
	createPublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
	base,
	optimism,
	zircuit,
	arbitrum,
	mainnet,
	baseSepolia,
	optimismSepolia,
	arbitrumSepolia,
	sepolia,
} from "viem/chains";

dotenv();

const API_BASE_URL = "https://trading.ai.zircuit.com/api/engine/v1";
const API_KEY = process.env.API_KEY;

const SUPPORTED_CHAINS = [
	base,
	optimism,
	zircuit,
	arbitrum,
	mainnet,
	baseSepolia,
	optimismSepolia,
	arbitrumSepolia,
	sepolia,
];

const WSS_URL = "wss://base-mainnet.g.alchemy.com/v2/XKkME-uEKeE12vDA5wjhm";
const POOL_MANAGER_ADDRESS = "0x498581ff718922c3f8e6a244956af099b2652b2b";

const POSITION_MANAGER_ADDRESS = "0x7c5f5a4bbd8fd63184577525326123b519429bdc";

const LEADER_ADDRESS =
	"0x55D13d1e80F811084940275ebA560733162B4dB2".toLowerCase();

const POOL_MANAGER_ABI = [
	"event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
];

const POSITION_MANAGER_ABI = [
	"function poolKeys(bytes25) view returns (address token0, address token1, uint24 fee, int24 tickSpacing)",
];

async function getTradeEstimate(quoteRequest) {
	try {
		const response = await apiRequest("/order/estimate", {
			method: "POST",
			body: JSON.stringify(quoteRequest),
		});

		// console.log("Trade estimate:", response);

		// Extract important data for next steps
		const { trade, tx } = response.data;

		// console.log("Trade:", trade);

		return {
			tradeId: trade.tradeId,
			expectedAmount: trade.destTokenAmount,
			minExpectedAmount: trade.destTokenMinAmount,
			txData: tx,
			fees: trade.fees,
		};
	} catch (error) {
		console.error("Failed to get trade estimate:", error);
		throw error;
	}
}

async function apiRequest(endpoint, options = {}) {
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${API_KEY}`,
		...(options.headers || {}),
	};

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			errorMessage = errorData.error || errorData.message || errorMessage;
		} catch {
			errorMessage = errorText || errorMessage;
		}

		throw new Error(errorMessage);
	}

	return response.json();
}

const getPublicClient = (chainId) => {
	const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
	if (!chain) {
		throw new Error(`Unsupported chain: ${chainId}`);
	}
	return createPublicClient({ chain, transport: http() });
};

async function main() {
	const provider = new ethers.WebSocketProvider(WSS_URL);
	const poolManager = new ethers.Contract(
		POOL_MANAGER_ADDRESS,
		POOL_MANAGER_ABI,
		provider
	);

	const positionManager = new ethers.Contract(
		POSITION_MANAGER_ADDRESS,
		POSITION_MANAGER_ABI,
		provider
	);

	poolManager.on(
		"Swap",
		async (
			id,
			sender,
			amount0,
			amount1,
			sqrtPriceX96,
			liquidity,
			tick,
			fee,
			event
		) => {
			//filter leader transactions
			const tx = await provider.getTransaction(event.log.transactionHash);
			const originator = tx.from;
			if (originator.toLowerCase() != LEADER_ADDRESS) {
				return;
			}

			// Pool id --> address in/out
			const poolIdBytes25 = slice(id, 0, 25);

			let token0, token1;
			try {
				const poolInfo = await positionManager.poolKeys(poolIdBytes25);
				token0 = poolInfo.token0;
				token1 = poolInfo.token1;

				console.log("token0:", token0);
				console.log("token1", token1);
			} catch (e) {
				console.error("Error fetching pool keys:", e);
				return;
			}

			let srcToken, srcAmount, destToken, destAmount;

			if (amount0 < 0) {
				srcToken = token0;
				srcAmount = amount0.toString();
				destToken = token1;
				destAmount = amount1.toString();
			} else {
				srcToken = token1;
				srcAmount = amount1.toString();
				destToken = token0;
				destAmount = amount0.toString();
			}

			console.log("--- Swap Details ---");
			console.log("Sender Address:", tx.from);
			console.log("Source Token Address:", srcToken);
			console.log("Source Token Amount:", srcAmount);
			console.log("Destination Token Address:", destToken);
			console.log("Destination Token Amount:", destAmount);

			const QUOTE_REQUEST = {
				srcChainId: 8453,
				srcToken: srcToken,
				srcAmountWei: -1 * srcAmount,
				destToken: destToken,
				destChainId: 8453,
				slippageBps: 100,
				userAccount: originator,
				destReceiver: originator,
			};

			console.log("Step 1: Getting trade estimate...");
			const estimate = await getTradeEstimate(QUOTE_REQUEST);
			console.log("GUD Engine Amount:", estimate.expectedAmount);
			
			const difference = estimate.expectedAmount - destAmount;
			console.log("Difference:", difference);

			if (difference > 0) {
				console.log("Difference is positive");
			} else {
				console.log("Difference is negative");
			}

			// Send data to frontend for real-time graphs
			const swapData = {
				destTokenAmount: parseFloat(destAmount),
				gudEngineAmount: parseFloat(estimate.expectedAmount),
				difference: parseFloat(difference),
				srcToken: srcToken,
				destToken: destToken,
				senderAddress: originator,
			};

			// Dispatch custom event to send data to React components
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('gudSwapData', { detail: swapData }));
			}
		}
	);

	console.log("📡 Listening for ALL Uniswap V4 Swap events via WebSocket...");
}

main().catch(console.error);
