// Update this page (the content is just a fallback if you fail to update the page)

import VaultHeader from "@/components/vault/VaultHeader";
import VaultStats from "@/components/vault/VaultStats";
import DepositWithdraw from "@/components/vault/DepositWithdraw";
import ChatPanel from "@/components/vault/ChatPanel";
import ReactiveGlow from "@/components/ux/ReactiveGlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <VaultHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="container relative py-16 px-4">
          <ReactiveGlow>
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                AI-Powered Copy Trading
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
                Zircuit Copy Trading Vault
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Shared USDC vault on Zircuit L2, executing AI-filtered copy trades via the GUD Trading Engine and temporary EIP-7702 delegation.
              </p>
              
              {/* Feature Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="text-center p-4 group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">AI Trading</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Smart trade filtering</p>
                </div>
                <div className="text-center p-4 group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg group-hover:shadow-purple-200/50 transition-all duration-300">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Community</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Shared vault benefits</p>
                </div>
                <div className="text-center p-4 group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg group-hover:shadow-green-200/50 transition-all duration-300">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Secure L2</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Protected by Zircuit</p>
                </div>
                <div className="text-center p-4 group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300">
                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Fast Execution</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">EIP-7702 delegation</p>
                </div>
              </div>
            </div>
          </ReactiveGlow>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-8 px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Vault Stats */}
          <div className="lg:col-span-2 space-y-6">
            <VaultStats />
            <DepositWithdraw />
          </div>
          
          {/* Right Column - Chat Panel */}
          <div className="space-y-6">
            <ChatPanel />
            
            {/* Quick Actions Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200" variant="outline">
                  <span className="group-hover:scale-110 transition-transform duration-200">📊</span>
                  <span className="ml-2">View Analytics</span>
                </Button>
                <Button className="w-full justify-start group hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200" variant="outline">
                  <span className="group-hover:scale-110 transition-transform duration-200">🔄</span>
                  <span className="ml-2">Refresh Data</span>
                </Button>
                <Button className="w-full justify-start group hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200" variant="outline">
                  <span className="group-hover:scale-110 transition-transform duration-200">📱</span>
                  <span className="ml-2">Mobile App</span>
                </Button>
                <Button className="w-full justify-start group hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200" variant="outline">
                  <span className="group-hover:scale-110 transition-transform duration-200">💬</span>
                  <span className="ml-2">Support Chat</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
