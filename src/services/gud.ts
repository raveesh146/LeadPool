// GUD Trading Engine API client (stub for MVP). Replace baseUrl and wire with your backend/edge function.
export type EstimateRequest = {
  fromToken: string; // e.g., USDC
  toToken: string;   // e.g., WETH
  amount: string;    // in smallest units
  fromChainId: number;
  toChainId?: number;
  slippageBps?: number;
};

export type EstimateResponse = {
  route: string;
  estimatedGas: string;
  fees: string;
  tx: {
    to: string;
    data: string;
    value: string;
  };
};

const baseUrl = "https://api.gud.trade"; // placeholder

export async function estimateOrder(req: EstimateRequest): Promise<EstimateResponse> {
  // const res = await fetch(`${baseUrl}/order/estimate`, { method: 'POST', body: JSON.stringify(req) })
  // return res.json()
  // MVP: return a mocked response
  return {
    route: "zircuit-sim",
    estimatedGas: "210000",
    fees: "3.5",
    tx: { to: "0xRouter", data: "0x", value: "0" },
  };
}

export async function approveTokenIfNeeded(
  _token: string,
  _spender: string,
  _amount: string
): Promise<boolean> {
  // Would check allowance via viem + submit approval if needed.
  return true;
}

export async function executeTrade(
  _tx: { to: string; data: string; value: string },
  _chainId: number
): Promise<string> {
  // Would use viem's walletClient to send the transaction on Zircuit.
  // Return tx hash
  return "0xsimulated_tx_hash";
}
