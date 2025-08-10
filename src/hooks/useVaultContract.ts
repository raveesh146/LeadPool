import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, GUD_SCANNER_ABI, USDC_ABI } from '@/lib/contracts'
import { toast } from 'sonner'

export const useVaultContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  // Contract write functions
  const { writeContract: writeGudScanner, data: gudScannerHash } = useWriteContract()
  const { writeContract: writeUSDC, data: usdcHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isGudScannerPending } = useWaitForTransactionReceipt({
    hash: gudScannerHash,
  })
  const { isLoading: isUSDCPending } = useWaitForTransactionReceipt({
    hash: usdcHash,
  })

  // Read contract data
  const { data: userPrincipal } = useReadContract({
    address: CONTRACTS.GUD_SCANNER,
    abi: GUD_SCANNER_ABI,
    functionName: 'principal',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: totalPrincipal } = useReadContract({
    address: CONTRACTS.GUD_SCANNER,
    abi: GUD_SCANNER_ABI,
    functionName: 'totalPrincipal',
    query: {
      enabled: !!CONTRACTS.GUD_SCANNER,
    },
  })

  const { data: isLocked } = useReadContract({
    address: CONTRACTS.GUD_SCANNER,
    abi: GUD_SCANNER_ABI,
    functionName: 'lock',
    query: {
      enabled: !!CONTRACTS.GUD_SCANNER,
    },
  })

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: usdcAllowance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && CONTRACTS.GUD_SCANNER ? [address, CONTRACTS.GUD_SCANNER] : undefined,
    query: {
      enabled: !!address && !!CONTRACTS.GUD_SCANNER,
    },
  })

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
      
      writeUSDC({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.GUD_SCANNER, amountWei],
      })

      toast.success('Approval transaction sent!')
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
      
      writeGudScanner({
        address: CONTRACTS.GUD_SCANNER,
        abi: GUD_SCANNER_ABI,
        functionName: 'deposit',
        args: [amountWei],
      })

      toast.success('Deposit transaction sent!')
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
    if (!address || !amount) {
      toast.error('Please connect wallet and enter amount')
      return false
    }

    if (!userPrincipal) {
      toast.error('No principal found')
      return false
    }

    const amountWei = parseUnits(amount, 6)
    if (amountWei > userPrincipal) {
      toast.error('Insufficient principal to withdraw')
      return false
    }

    try {
      setIsLoading(true)
      
      writeGudScanner({
        address: CONTRACTS.GUD_SCANNER,
        abi: GUD_SCANNER_ABI,
        functionName: 'withdraw',
        args: [amountWei],
      })

      toast.success('Withdrawal transaction sent!')
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

  return {
    // State
    isLoading: isLoading || isGudScannerPending || isUSDCPending,
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
  }
} 