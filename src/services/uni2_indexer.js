// install: npm install ethers@6
const { ethers } = require("ethers");

// ========= CONFIG =========
const LEADER_ADDRESS =
	"0x55D13d1e80F811084940275ebA560733162B4dB2".toLowerCase(); // input leader address here
const WSS_URL = "wss://base-mainnet.g.alchemy.com/v2/XKkME-uEKeE12vDA5wjhm"; // Replace with your actual API key
const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dce68Ed026d694621f6FDfD"; // Uniswap V3 Factory on Base

// ABIs
const FACTORY_ABI = [
	"event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
];

const POOL_ABI = [
	"event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
	"function token0() view returns (address)",
	"function token1() view returns (address)",
];

async function main() {
	try {
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

			try {
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

				poolContract.on(
					"Swap",
					(
						sender,
						recipient,
						amount0,
						amount1,
						sqrtPriceX96,
						liquidity,
						tick
					) => {
						if (
							sender.toLowerCase() === LEADER_ADDRESS ||
							recipient.toLowerCase() === LEADER_ADDRESS
						) {
							let srcToken, destToken, srcAmount, destAmount;

							// Convert to BigInt for proper handling
							const amt0 = BigInt(amount0.toString());
							const amt1 = BigInt(amount1.toString());

							if (amt0 < 0n) {
								// Leader sold token0, received token1
								srcToken = token0;
								srcAmount = amt0 * -1n;
								destToken = token1;
								destAmount = amt1;
							} else {
								// Leader sold token1, received token0
								srcToken = token1;
								srcAmount = amt1 * -1n;
								destToken = token0;
								destAmount = amt0;
							}

							console.log({
								pool: poolAddress,
								leader:
									sender.toLowerCase() === LEADER_ADDRESS
										? sender
										: recipient,
								srcToken,
								srcAmount: srcAmount.toString(),
								destToken,
								destAmount: destAmount.toString(),
								timestamp: new Date().toISOString(),
							});
						}
					}
				);

				// Handle potential errors from the pool contract
				poolContract.on("error", (error) => {
					console.error(`Error from pool ${poolAddress}:`, error);
				});
			} catch (error) {
				console.error(
					`Failed to subscribe to pool ${poolAddress}:`,
					error
				);
				subscribedPools.delete(poolAddress); // Remove from set if subscription failed
			}
		}

		// Listen for new pools being created
		factory.on(
			"PoolCreated",
			async (token0, token1, fee, tickSpacing, pool) => {
				console.log(
					`New pool created: ${pool} (${token0}/${token1}, fee: ${fee})`
				);
				await subscribePool(pool);
			}
		);

		// Handle factory errors
		factory.on("error", (error) => {
			console.error("Factory contract error:", error);
		});

		// Handle WebSocket connection errors
		provider.on("error", (error) => {
			console.error("WebSocket provider error:", error);
		});

		// Graceful shutdown
		process.on("SIGINT", () => {
			console.log("\nShutting down gracefully...");
			provider.destroy();
			process.exit(0);
		});

		console.log("Setup complete. Monitoring for new pools and swaps...");
	} catch (error) {
		console.error("Failed to initialize:", error);
	}
}

main().catch(console.error);
