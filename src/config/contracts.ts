// Contract addresses for different networks
// Update these with your actual deployed contract addresses

export const CONTRACT_ADDRESSES = {
  // Sepolia testnet (default)
  sepolia: {
    GUD_SCANNER: '0x...', // Replace with your deployed GudScanner contract address
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  },
  
  // Mainnet
  mainnet: {
    GUD_SCANNER: '0x...', // Replace with your deployed GudScanner contract address
    USDC: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8', // Mainnet USDC
  },
  
  // Zircuit L2 (if different from mainnet)
  zircuit: {
    GUD_SCANNER: '0x...', // Replace with your deployed GudScanner contract address
    USDC: '0x...', // Zircuit L2 USDC address
  }
} as const

// Current network (change this based on your deployment)
export const CURRENT_NETWORK: keyof typeof CONTRACT_ADDRESSES = 'sepolia'

// Export current addresses
export const CONTRACTS = CONTRACT_ADDRESSES[CURRENT_NETWORK] 