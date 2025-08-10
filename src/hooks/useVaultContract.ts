import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, GUD_SCANNER_ABI, USDC_ABI } from '@/lib/contracts'
import { toast } from 'sonner'

export const useVaultContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for now - replace with actual contract calls when ready
  const [userPrincipal, setUserPrincipal] = useState<bigint>(0n)
  const [totalPrincipal, setTotalPrincipal] = useState<bigint>(0n)
  const [isLocked, setIsLocked] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n)
  const [usdcAllowance, setUsdcAllowance] = useState<bigint>(0n)

  // Helper function to check if user has sufficient allowance
  const hasSufficientAllowance = (amount: string) => {
    if (!usdcAllowance || !amount) return false
    const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
    return usdcAllowance >= amountWei
  }

  // Helper function to check if user has sufficient balance
  const hasSufficientBalance = (amount: string) => {
    if (!usdcBalance || !amount) return false
    const amountWei = parseUnits(amount, 6)
    return usdcBalance >= amountWei
  }

  // Approve USDC spending
  const approveUSDC = async (amount: string) => {
    if (!address || !amount) {
      toast.error('Please connect wallet and enter amount')
      return false
    }

    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 6)
      
      // TODO: Replace with actual contract call
      console.log('Approving USDC spending:', {
        spender: CONTRACTS.GUD_SCANNER,
        amount: amountWei.toString()
      })
      
      // Simulate approval
      setUsdcAllowance(amountWei)
      
      toast.success('USDC approval successful!')
      return true
    } catch (error) {
      console.error('Approval error:', error)
      toast.error('Failed to approve USDC spending')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Deposit USDC to vault
  const depositUSDC = async (amount: string) => {
    if (!address || !amount) {
      toast.error('Please connect wallet and enter amount')
      return false
    }

    if (isLocked) {
      toast.error('Vault is currently locked for deposits')
      return false
    }

    if (!hasSufficientBalance(amount)) {
      toast.error('Insufficient USDC balance')
      return false
    }

    if (!hasSufficientAllowance(amount)) {
      toast.error('Please approve USDC spending first')
      return false
    }

    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 6)
      
      // TODO: Replace with actual contract call
      console.log('Depositing USDC:', {
        amount: amountWei.toString(),
        user: address
      })
      
      // Simulate deposit
      setUserPrincipal(prev => prev + amountWei)
      setTotalPrincipal(prev => prev + amountWei)
      setUsdcBalance(prev => prev - amountWei)
      
      toast.success('Deposit successful!')
      return true
    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Failed to deposit USDC')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw USDC from vault
  const withdrawUSDC = async (amount: string) => {
    if (!address || !amount) return false

    const numAmount = Number(amount)
    if (!isFinite(numAmount) || numAmount <= 0) {
      toast.error('Invalid amount')
      return false
    }

    if (!userPrincipal) {
      toast.error('No principal found')
      return false
    }

    const amountWei = parseUnits(amount, 6)
    if (userPrincipal && amountWei > userPrincipal) {
      toast.error('Insufficient principal to withdraw')
      return false
    }

    try {
      setIsLoading(true)
      
      // TODO: Replace with actual contract call
      console.log('Withdrawing USDC:', {
        amount: amountWei.toString(),
        user: address
      })
      
      // Simulate withdrawal
      setUserPrincipal(prev => prev - amountWei)
      setTotalPrincipal(prev => prev - amountWei)
      setUsdcBalance(prev => prev + amountWei)
      
      toast.success('Withdrawal successful!')
      return true
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error('Failed to withdraw USDC')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Format values for display
  const formatUSDC = (value: bigint | undefined) => {
    if (!value) return '0.00'
    return formatUnits(value, 6)
  }

  const formatPrincipal = (value: bigint | undefined) => {
    if (!value) return '0.00'
    return formatUnits(value, 6)
  }

  // Mock function to set initial values (remove when using real contracts)
  const initializeMockData = () => {
    setUserPrincipal(1000n * 10n**6n) // 1000 USDC
    setTotalPrincipal(50000n * 10n**6n) // 50000 USDC
    setIsLocked(false)
    setUsdcBalance(5000n * 10n**6n) // 5000 USDC
    setUsdcAllowance(0n) // No allowance initially
  }

  return {
    // State
    isLoading,
    isLocked,
    
    // User data
    userPrincipal: formatPrincipal(userPrincipal),
    totalPrincipal: formatPrincipal(totalPrincipal),
    usdcBalance: formatUSDC(usdcBalance),
    usdcAllowance: formatUSDC(usdcAllowance),
    
    // Helper functions
    hasSufficientAllowance,
    hasSufficientBalance,
    
    // Contract functions
    approveUSDC,
    depositUSDC,
    withdrawUSDC,
    
    // Format functions
    formatUSDC,
    formatPrincipal,
    
    // Mock functions (remove when using real contracts)
    initializeMockData,
  }
} 