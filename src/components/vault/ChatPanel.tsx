import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, User, TrendingUp, TrendingDown, Activity, Zap, Shield, Wallet, Network } from "lucide-react";
import { useState } from "react";

const ChatPanel = () => {
  // Local state for messages and simulation
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Welcome to the AI Trading Agent! I\'m monitoring market conditions and will provide trading signals.', timestamp: new Date() },
    { id: 2, type: 'bot', content: 'ETH showing bullish momentum with 87% confidence. Consider monitoring for entry opportunities.', timestamp: new Date() },
  ]);
  const [threshold] = useState(75);
  const [newMessage, setNewMessage] = useState("");

  const simulate = (direction: "BUY" | "SELL") => {
    const bullishScore = Math.floor(60 + Math.random() * 40);
    const leader = "0xLeaderWallet000000000000000000000000000000";
    
    // Simulate trade signal
    const newMessage = {
      id: Date.now(),
      type: 'bot' as const,
      content: `Trade signal: ${direction} ETH with ${bullishScore}% confidence. Leader wallet: ${leader.slice(0, 8)}...`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    console.log('Trade simulation:', { leader, symbol: "ETH", direction, usdcAmount: 500, bullishScore });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user' as const,
        content: newMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot' as const,
          content: 'Thank you for your message. I\'m analyzing the market and will provide insights shortly.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  // Mock trading signals for better UI
  const tradingSignals = [
    { symbol: "ETH", direction: "BUY", confidence: 87, price: 2450.50, change: "+2.4%" },
    { symbol: "BTC", direction: "SELL", confidence: 73, price: 43250.00, change: "-1.2%" },
    { symbol: "SOL", direction: "BUY", confidence: 92, price: 98.75, change: "+5.1%" },
  ];

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
      {/* Background geometric elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border border-blue-400/30 rounded-lg"></div>
        <div className="absolute top-20 left-8 w-8 h-8 border border-blue-300/20 rounded-full"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border border-blue-400/30 rotate-45"></div>
        <div className="absolute top-24 right-4 w-6 h-6 border border-blue-300/20 rounded-full"></div>
        <div className="absolute bottom-8 left-12 w-10 h-10 border border-blue-400/30"></div>
        <div className="absolute bottom-20 right-16 w-8 h-8 border border-blue-300/20 rounded-full"></div>
      </div>

      <CardHeader className="pb-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white">AI Trading Agent</div>
              <div className="text-sm text-blue-300 font-normal">Powered by Zircuit</div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              AI Active
            </Badge>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6 relative z-10">
        {/* Trading Signals */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-5 shadow-lg border border-slate-600/30 backdrop-blur-sm">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-lg">Live Trading Signals</span>
          </h4>
          <div className="space-y-3">
            {tradingSignals.map((signal, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    signal.direction === "BUY" ? "bg-green-400 shadow-lg shadow-green-400/30" : "bg-red-400 shadow-lg shadow-red-400/30"
                  }`} />
                  <div>
                    <div className="font-semibold text-white">{signal.symbol}</div>
                    <div className="text-xs text-slate-400">
                      Confidence: <span className="text-blue-300 font-medium">{signal.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${signal.price.toLocaleString()}</div>
                  <div className={`text-sm font-medium ${
                    signal.change.startsWith("+") ? "text-green-400" : "text-red-400"
                  }`}>
                    {signal.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-5 shadow-lg border border-slate-600/30 backdrop-blur-sm">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-lg">Quick Actions</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => simulate("BUY")}
              className="h-12 text-green-400 border-green-500/30 hover:bg-green-500/10 hover:border-green-400/50 bg-green-500/5 transition-all duration-200"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Simulate BUY
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => simulate("SELL")}
              className="h-12 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50 bg-red-500/5 transition-all duration-200"
            >
              <TrendingDown className="w-5 h-5 mr-2" />
              Simulate SELL
            </Button>
          </div>
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="text-sm text-slate-300">
              Bullish threshold: <span className="font-medium text-blue-300">{threshold}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">AI agent monitors market sentiment</div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-5 shadow-lg border border-slate-600/30 backdrop-blur-sm">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-lg">Agent Updates</span>
          </h4>
          
          {/* Messages */}
          <div className="h-48 overflow-y-auto rounded-lg border border-slate-600/30 bg-slate-700/30 p-4 mb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs px-2 py-1 h-6 bg-slate-600/50 border-slate-500/30 text-slate-300">
                          {m.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <div className="w-12 h-12 mx-auto mb-3 p-2 bg-slate-600/50 rounded-full border border-slate-500/30">
                    <Bot className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-300">No messages yet</p>
                  <p className="text-xs text-slate-500">AI agent will provide updates here</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask the AI agent..."
              className="flex-1 bg-slate-700/50 border-slate-600/30 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button 
              size="lg" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 h-12 transition-all duration-200 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Status Info */}
        <div className="text-center p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600/30">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Agent monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Real-time analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Secure operations</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
