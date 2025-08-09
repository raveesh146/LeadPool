import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const VaultHeader = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const navigationItems = [
    { id: "overview", label: "Overview",  },
    { id: "vault", label: "Vault"},
    { id: "trading", label: "Trading" },
    { id: "analytics", label: "Analytics"},
    { id: "settings", label: "Settings"},
  ];

  return (
    <header className="w-full border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
      <div className="container flex items-center justify-between py-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:shadow-purple-500/40 group-hover:scale-105 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Zircuit Copilot
              </span>
              <span className="text-xs text-blue-200/70">AI-Powered Copy Trading</span>
            </div>
          </a>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`h-9 px-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white/10 text-white border border-white/20 shadow-lg"
                    : "text-blue-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live Trading
          </Badge>
          
          {/* Connect Button */}
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>
    </header>
  );
};

export default VaultHeader;
