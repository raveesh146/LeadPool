const { ethers } = require("ethers");

let qvar = 0;

const WSS_URL = "wss://base-mainnet.g.alchemy.com/v2/XKkME-uEKeE12vDA5wjhm";
const POOL_MANAGER_ADDRESS = "0x498581ff718922c3f8e6a244956af099b2652b2b";

const LEADER_ADDRESS = "0x55D13d1e80F811084940275ebA560733162B4dB2".toLowerCase();

const POOL_MANAGER_ABI = [
	"event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
];


async function main() {
	const provider = new ethers.WebSocketProvider(WSS_URL);
	const poolManager = new ethers.Contract(
		POOL_MANAGER_ADDRESS,
		POOL_MANAGER_ABI,
		provider
	);

    poolManager.on("Swap", async (id, sender, amount0, amount1, sqrtPriceX96, liquidity, tick, fee, event) => {
        if ( qvar >= 1 ){ return };
        qvar = qvar + 1
        console.log("Full event object:", event);
        console.log(sender)
        console.log("transactionHash:", event.log.transactionHash);
        // console.log("event" , event);
        const tx = await provider.getTransaction(event.log.transactionHash);
        // const originator = tx.from;
        console.log(tx.from)
        
        // console.log(originator)
        // if (sender.toLowerCase() !== LEADER_ADDRESS) return;

		// console.log({
		// 	blockNumber: event.blockNumber,
		// 	txHash: event.transactionHash,
		// 	poolId: id,
		// 	sender,
		// 	recipient,
		// 	delta0: delta0.toString(),
		// 	delta1: delta1.toString(),
		// });
	});

	console.log("📡 Listening for ALL Uniswap V4 Swap events via WebSocket...");
}

main().catch(console.error);
