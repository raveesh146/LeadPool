import { Address } from 'viem'
import { CONTRACTS as CONFIG_CONTRACTS } from '@/config/contracts'

// Contract addresses from configuration
export const CONTRACTS = {
  GUD_SCANNER: CONFIG_CONTRACTS.GUD_SCANNER as Address,
  USDC: CONFIG_CONTRACTS.USDC as Address,
} as const

// ABI for the GudScanner contract (AIagentVault)
export const GUD_SCANNER_ABI = [{"type":"constructor","inputs":[{"name":"_usdc","type":"address","internalType":"contract IERC20"}],"stateMutability":"nonpayable"},{"type":"fallback","stateMutability":"payable"},{"type":"receive","stateMutability":"payable"},{"type":"function","name":"agentExecuteGudTrade","inputs":[{"name":"trade","type":"tuple","internalType":"struct AIagentVault.GudTrade","components":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"},{"name":"data","type":"bytes","internalType":"bytes"}]},{"name":"srcToken","type":"address","internalType":"address"},{"name":"srcTokenAmount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"authorizedAgent","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"deposit","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"lock","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"principal","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setAuthorizedAgent","inputs":[{"name":"_agent","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setLock","inputs":[{"name":"_state","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"sweepToken","inputs":[{"name":"token","type":"address","internalType":"contract IERC20"},{"name":"recipient","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"totalPrincipal","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"usdc","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IERC20"}],"stateMutability":"view"},{"type":"function","name":"userShare","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"withdraw","inputs":[{"name":"principalAmount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"AgentExecuted","inputs":[{"name":"usdcAmountSpent","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"target","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"event","name":"AuthorizedAgentChanged","inputs":[{"name":"oldAgent","type":"address","indexed":true,"internalType":"address"},{"name":"newAgent","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"Deposited","inputs":[{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"GudTradeExecuted","inputs":[{"name":"srcToken","type":"address","indexed":false,"internalType":"address"},{"name":"srcTokenAmount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"target","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"event","name":"LockChanged","inputs":[{"name":"newLockState","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"Withdrawn","inputs":[{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"principalWithdrawn","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"payout","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"EthNotSupportedInGudTrade","inputs":[]},{"type":"error","name":"NotAIAgent","inputs":[]},{"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},{"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]},{"type":"error","name":"SafeERC20FailedOperation","inputs":[{"name":"token","type":"address","internalType":"address"}]}]
// USDC token ABI (minimal for approvals)
export const USDC_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const 