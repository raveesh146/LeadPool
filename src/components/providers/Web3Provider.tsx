import { PropsWithChildren, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";

// NOTE: Zircuit L2 chain can be added here once RPC and chainId are confirmed.
// const zircuit = {
//   id: 0000 as const, // TODO: replace with actual chain id
//   name: 'Zircuit',
//   nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
//   rpcUrls: { default: { http: ['https://<zircuit-rpc>'] } },
// } as const; // Example placeholder

export function Web3Provider({ children }: PropsWithChildren) {
  const chains = [sepolia] as const;

  const connectors = useMemo(
    () =>
      connectorsForWallets(
        [
          {
            groupName: "Wallets",
            wallets: [injectedWallet],
          },
        ],
        {
          appName: "Zircuit Copy Trading Vault",
          projectId: "demo",
        }
      ),
    []
  );

  const config = useMemo(
    () =>
      createConfig({
        chains,
        connectors,
        ssr: true,
        transports: {
          [sepolia.id]: http(),
        },
      }),
    [chains, connectors]
  );

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "hsl(var(--primary))",
          accentColorForeground: "hsl(var(--primary-foreground))",
          borderRadius: "large",
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
