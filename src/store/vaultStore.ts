import { create } from "zustand";

export type VaultMessage = {
  id: string;
  type: "info" | "trade" | "error";
  content: string;
  ts: number;
};

type Contributor = {
  deposited: number; // in USDC
  shares: number;
};

export type VaultState = {
  totalUSDC: number;
  totalShares: number;
  holdings: Record<string, number>; // token symbol -> amount (USDC-denominated for simplicity)
  contributors: Record<string, Contributor>; // address -> data
  messages: VaultMessage[];
  bullishThreshold: number; // 0-100

  deposit: (address: string, amount: number) => void;
  withdraw: (address: string, amount: number) => void;
  simulateTrade: (args: {
    leader: string;
    symbol: string;
    direction: "BUY" | "SELL";
    usdcAmount: number;
    bullishScore: number; // 0-100
  }) => void;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export const useVaultStore = create<VaultState>((set, get) => ({
  totalUSDC: 10_000,
  totalShares: 10_000,
  holdings: { USDC: 8000, ETH: 1500, BTC: 500 },
  contributors: {},
  messages: [
    {
      id: uid(),
      type: "info",
      content: "Agent online. Monitoring leader wallets via GUD.",
      ts: Date.now(),
    },
  ],
  bullishThreshold: 65,

  deposit: (address, amount) =>
    set((state) => {
      if (amount <= 0) return state;
      const pricePerShare = state.totalUSDC / (state.totalShares || 1);
      const mintShares = amount / pricePerShare;
      const prev = state.contributors[address] || { deposited: 0, shares: 0 };
      const contributors = {
        ...state.contributors,
        [address]: {
          deposited: prev.deposited + amount,
          shares: prev.shares + mintShares,
        },
      };
      const messages = [
        {
          id: uid(),
          type: "info" as const,
          content: `Deposit: ${amount.toFixed(2)} USDC by ${address.slice(0, 6)}…${address.slice(-4)}`,
          ts: Date.now(),
        },
        ...state.messages,
      ];
      return {
        ...state,
        contributors,
        totalUSDC: state.totalUSDC + amount,
        totalShares: state.totalShares + mintShares,
        holdings: { ...state.holdings, USDC: (state.holdings.USDC || 0) + amount },
        messages,
      };
    }),

  withdraw: (address, amount) =>
    set((state) => {
      const user = state.contributors[address];
      if (!user || amount <= 0) return state;
      const maxWithdraw = (user.shares / state.totalShares) * state.totalUSDC;
      const actual = Math.min(amount, maxWithdraw);
      const pricePerShare = state.totalUSDC / state.totalShares;
      const burnShares = actual / pricePerShare;
      const remainingShares = Math.max(user.shares - burnShares, 0);
      const contributors = {
        ...state.contributors,
        [address]: {
          deposited: Math.max(user.deposited - actual, 0),
          shares: remainingShares,
        },
      };
      const messages = [
        {
          id: uid(),
          type: "info" as const,
          content: `Withdraw: ${actual.toFixed(2)} USDC by ${address.slice(0, 6)}…${address.slice(-4)}`,
          ts: Date.now(),
        },
        ...state.messages,
      ];
      const usdcLeft = Math.max((state.holdings.USDC || 0) - actual, 0);
      return {
        ...state,
        contributors,
        totalUSDC: state.totalUSDC - actual,
        totalShares: Math.max(state.totalShares - burnShares, 0.0001),
        holdings: { ...state.holdings, USDC: usdcLeft },
        messages,
      };
    }),

  simulateTrade: ({ leader, symbol, direction, usdcAmount, bullishScore }) =>
    set((state) => {
      const threshold = state.bullishThreshold;
      if (bullishScore < threshold) {
        return {
          ...state,
          messages: [
            {
              id: uid(),
              type: "info",
              content: `Skipped ${symbol} ${direction} (bullish ${bullishScore} < threshold ${threshold}).`,
              ts: Date.now(),
            },
            ...state.messages,
          ],
        };
      }

      const usdc = state.holdings.USDC || 0;
      const amount = Math.min(usdcAmount, usdc);
      const holdings = { ...state.holdings };

      if (direction === "BUY") {
        holdings.USDC = usdc - amount;
        holdings[symbol] = (holdings[symbol] || 0) + amount; // Treat as USDC notionals
      } else {
        const tokenBal = holdings[symbol] || 0;
        const sell = Math.min(tokenBal, amount);
        holdings[symbol] = Math.max(tokenBal - sell, 0);
        holdings.USDC = (holdings.USDC || 0) + sell;
      }

      const impact = (Math.random() - 0.5) * 0.01; // +/-0.5%
      const totalUSDC = Math.max(state.totalUSDC * (1 + impact), 0.01);

      const summary = `${direction} ${symbol} $${amount.toFixed(2)} (bullish ${bullishScore}). Leader ${leader.slice(0, 6)}…${leader.slice(-4)}`;

      return {
        ...state,
        holdings,
        totalUSDC,
        messages: [
          { id: uid(), type: "trade", content: summary, ts: Date.now() },
          ...state.messages,
        ],
      };
    }),
}));

export function contributorValue(address: string) {
  const state = useVaultStore.getState();
  const user = state.contributors[address];
  if (!user) return 0;
  const share = user.shares / (state.totalShares || 1);
  return share * state.totalUSDC;
}

export function composition() {
  const { holdings } = useVaultStore.getState();
  const total = Object.values(holdings).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(holdings).map(([k, v]) => ({ key: k, value: v, pct: (v / total) * 100 }));
}
