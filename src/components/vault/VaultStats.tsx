import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVaultContract } from "@/hooks/useVaultContract";
import { useGudEngineData } from "@/hooks/useGudEngineData";
import { Pie, PieChart, Cell, Tooltip as ReTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Database } from "lucide-react";
import { useState } from "react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--secondary-foreground))",
];

const VaultStats = () => {
  const { totalPrincipal } = useVaultContract();
  const { getChartData, getLatestMetrics, addConsoleData } = useGudEngineData();
  const [selectedChart, setSelectedChart] = useState("gud");

  // Get real-time GUD Engine data
  const chartData = getChartData();
  const latestMetrics = getLatestMetrics();

  // Mock data for now - replace with real data when contracts are connected
  const holdings = {
    "USDC": parseFloat(totalPrincipal) || 0,
    "ETH": 0,
    "BTC": 0,
  };
  
  const data = Object.entries(holdings).map(([k, v]) => ({ name: k, value: v }));
  
  const totalValue = Object.values(holdings).reduce((sum, value) => sum + value, 0);
  const changePercent = latestMetrics ? (latestMetrics.avgDifference / latestMetrics.latestDestAmount * 100) : 0;
  const isPositive = changePercent > 0;

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 text-blue-600" />
            Vault Overview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedChart === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart("pie")}
              className="h-8 px-3"
            >
              Distribution
            </Button>
            <Button
              variant={selectedChart === "gud" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart("gud")}
              className="h-8 px-3"
            >
              GUD Engine
            </Button>
            <Button
              variant={selectedChart === "performance" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart("performance")}
              className="h-8 px-3"
            >
              Performance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChart("console")}
              className="h-8 px-3"
            >
              <Database className="w-4 h-4 mr-1" /> Console Data
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${parseFloat(totalPrincipal).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Latest Swap</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {latestMetrics ? `$${latestMetrics.latestDestAmount.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Difference</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {latestMetrics ? `${changePercent.toFixed(2)}%` : 'N/A'}
                  </p>
                  {latestMetrics && (
                    changePercent > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                latestMetrics && changePercent > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <div className={`w-6 h-6 rounded-full ${
                  latestMetrics && changePercent > 0 ? 'bg-green-600' : 'bg-red-600'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm">
          {selectedChart === "pie" ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Asset Distribution</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={data} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={40} 
                        outerRadius={80} 
                        stroke="hsl(var(--border))"
                        paddingAngle={2}
                      >
                        {data.map((_, i) => (
                          <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip cursor={{ fill: "transparent" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Holdings Breakdown</h4>
                <div className="space-y-3">
                  {data.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="font-medium text-slate-900 dark:text-white">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">${d.value.toFixed(2)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {((d.value / totalValue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedChart === "gud" ? (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">GUD Engine vs Uniswap V4 Real-time Data</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Line 
                      type="monotone" 
                      dataKey="destAmount" 
                      name="Uniswap V4 Amount"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gudAmount" 
                      name="GUD Engine Amount"
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Blue line: Uniswap V4 actual swap amount | Green line: GUD Engine expected amount</p>
                <p>Data updates in real-time as swaps occur on Base chain</p>
              </div>
            </div>
          ) : selectedChart === "performance" ? (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Performance Difference Over Time</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Line 
                      type="monotone" 
                      dataKey="difference" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Shows the difference between GUD Engine expected amount and Uniswap V4 actual amount</p>
                <p>Positive values indicate GUD Engine overestimated, negative values indicate underestimation</p>
              </div>
            </div>
          ) : selectedChart === "console" ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-white">Console Data (Last 5 Transactions)</h4>
                <Button 
                  onClick={addConsoleData}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Load Console Data
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Line 
                      type="monotone" 
                      dataKey="destAmount" 
                      name="Uniswap V4 Amount"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gudAmount" 
                      name="GUD Engine Amount"
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Click "Load Console Data" to immediately plot the last 5 transactions from your console</p>
                <p>This will show real data from your indexer console logs</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Total Assets: {Object.keys(holdings).length}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Total Swaps: {latestMetrics ? latestMetrics.totalSwaps : 0}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            Live Data: {chartData.length > 0 ? 'Active' : 'Waiting'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default VaultStats;
