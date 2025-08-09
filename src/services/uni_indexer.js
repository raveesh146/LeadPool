// install: npm install ethers@6
const { ethers } = require("ethers");

// ========= CONFIG =========
const LEADER_ADDRESS ="0x55D13d1e80F811084940275ebA560733162B4dB2".toLowerCase(); // input leader address here
const WSS_URL = "wss://base-mainnet.g.alchemy.com/v2/XKkME-uEKeE12vDA5wjhm"; // must be wss, not https
const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dce68Ed026d694621f6FDfD"; // Uniswap V3 Factory on Base

// ABIs
const FACTORY_ABI = [
	"event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)",
];

const POOL_ABI = [
	"event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
	"function token0() view returns (address)",
	"function token1() view returns (address)",
];

async function main() {
	const provider = new ethers.WebSocketProvider(WSS_URL);

	const factory = new ethers.Contract(
		UNISWAP_V3_FACTORY,
		FACTORY_ABI,
		provider
	);

	console.log("Listening for new pools...");

	// Track pools we've already subscribed to
	const subscribedPools = new Set();

	async function subscribePool(poolAddress) {
		if (subscribedPools.has(poolAddress)) return;
		subscribedPools.add(poolAddress);

		const poolContract = new ethers.Contract(
			poolAddress,
			POOL_ABI,
			provider
		);

		const token0 = await poolContract.token0();
		const token1 = await poolContract.token1();

		console.log(`Subscribed to pool: ${poolAddress}`);
		console.log(`  token0: ${token0}`);
		console.log(`  token1: ${token1}`);

		poolContract.on("Swap", (sender, recipient, amount0, amount1) => {
			if (
				sender.toLowerCase() === LEADER_ADDRESS ||
				recipient.toLowerCase() === LEADER_ADDRESS
			) {
				let srcToken, destToken, srcAmount, destAmount;

				if (amount0 < 0) {
					// Leader sold token0, received token1
					srcToken = token0;
					srcAmount = amount0 * -1n;
					destToken = token1;
					destAmount = amount1;
				} else {
					// Leader sold token1, received token0
					srcToken = token1;
					srcAmount = amount1 * -1n;
					destToken = token0;
					destAmount = amount0;
				}

				console.log({
					pool: poolAddress,
					srcToken,
					srcAmount: srcAmount.toString(),
					destToken,
					destAmount: destAmount.toString(),
				});
			}
		});
	}

	// Listen for new pools being created
	factory.on(
		"PoolCreated",
		async (token0, token1, fee, tickSpacing, pool) => {
			await subscribePool(pool);
		}
	);

	// Optionally: subscribe to existing pools on startup
	console.log(
		"Fetching existing pools from factory (optional: needs RPC calls)"
	);
	// You'd need to scan logs for PoolCreated if you want all historical pools.
}

main().catch(console.error);
