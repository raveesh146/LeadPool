// Contract addresses for different networks
// Update these with your actual deployed contract addresses

export const CONTRACT_ADDRESSES = {
  base: {
    GUD_SCANNER: '0xa505ca49a30751424a078dadb785d2F9b4D3b446',
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Base USDC address
  }
} as const

// Current network (change this based on your deployment)
export const CURRENT_NETWORK: keyof typeof CONTRACT_ADDRESSES = 'base'

// Export current addresses
export const CONTRACTS = CONTRACT_ADDRESSES[CURRENT_NETWORK] 
