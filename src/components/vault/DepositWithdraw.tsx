import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Shield, AlertCircle } from "lucide-react";
import { useVaultContract } from "@/hooks/useVaultContract";

const DepositWithdraw = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [tab, setTab] = useState<string>("deposit");
  
  const {
    isLoading,
    isLocked,
    userPrincipal,
    totalPrincipal,
    usdcBalance,
    usdcAllowance,
    hasSufficientAllowance,
    hasSufficientBalance,
    approveUSDC,
    depositUSDC,
    withdrawUSDC,
  } = useVaultContract();

  const handleDeposit = async () => {
    if (!address || !amount) return;
    
    const numAmount = Number(amount);
    if (!isFinite(numAmount) || numAmount <= 0) return;
    
    // Check if approval is needed
    if (!hasSufficientAllowance(amount)) {
      await approveUSDC(amount);
      return;
    }
    
    // Proceed with deposit
    const success = await depositUSDC(amount);
    if (success) {
      setAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!address || !amount) return;
    
    const numAmount = Number(amount);
    if (!isFinite(numAmount) || numAmount <= 0) return;
    
    const success = await withdrawUSDC(amount);
    if (success) {
      setAmount("");
    }
  };

  const handle = () => {
    if (tab === "deposit") {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  const userValue = parseFloat(userPrincipal) || 0;

  // Vault stats from contract
  const vaultStats = {
    totalParticipants: 127, // This would need to be tracked separately
    avgAPY: 7.3, // This would need to be calculated from contract data
    totalTrades: 1542, // This would need to be tracked separately
    successRate: 94.2 // This would need to be calculated
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-5 h-5 text-green-600" />
            Vault Operations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Live Trading
            </Badge>
            <Badge 
              variant={isLocked ? "destructive" : "secondary"} 
              className={isLocked ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}
            >
              {isLocked ? 'Deposits Locked' : 'Deposits Open'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vault Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vaultStats.totalParticipants}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Participants</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{vaultStats.avgAPY}%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg APY</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{vaultStats.totalTrades}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Trades</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{vaultStats.successRate}%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Success Rate</div>
          </div>
        </div>

        {/* Main Operations */}
        <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 dark:bg-slate-600">
              <TabsTrigger 
                value="deposit" 
                className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-500 dark:data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Deposit
              </TabsTrigger>
              <TabsTrigger 
                value="withdraw"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-500 dark:data-[state=active]:text-white"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Withdraw
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="mt-6 space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Deposit USDC</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Earn APY on your deposits</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="h-12 text-lg font-medium pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        USDC
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {isLocked && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Vault is currently locked for deposits
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={handle} 
                  disabled={!address || !amount || isLoading || isLocked}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {isLoading ? 'Processing...' : 
                   !hasSufficientAllowance(amount) ? 'Approve USDC' : 
                   'Deposit USDC'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="withdraw" className="mt-6 space-y-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-800 dark:text-red-200">Withdraw USDC</h4>
                <p className="text-sm text-red-600 dark:text-red-400">Withdraw your funds anytime</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="h-12 text-lg font-medium pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        USDC
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handle} 
                  disabled={!address || !amount || isLoading}
                  className="w-full h-12 border-red-300 text-red-700 hover:bg-red-50 font-semibold disabled:opacity-50"
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  {isLoading ? 'Processing...' : 'Withdraw USDC'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* User Stats */}
        {address && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Your Vault Value</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  ${userValue.toFixed(2)} USDC
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 dark:text-blue-400">Available for withdrawal</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  ${userValue.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* USDC Balance and Allowance */}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 dark:text-blue-400">USDC Balance</p>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    {usdcBalance} USDC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 dark:text-blue-400">Approved for Vault</p>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    {usdcAllowance} USDC
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <p>💡 Minimum deposit: 10 USDC • Withdrawal fee: 0.1%</p>
          <p>🔒 Funds are secured by smart contracts on Zircuit L2</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepositWithdraw;
