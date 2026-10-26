import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Menu,
  RefreshCw,
  Coins,
  Wallet,
  Shield,
  ArrowUpRight
} from "lucide-react";

export default function Header({ activeTab, setActiveTab, setMobileOpen }) {
  const { currentUser, walletInfo, blockchainStatus, refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const titles = {
    dashboard: "Overview & Dashboard",
    register: "Register Music Work",
    registry: "Copyright Registry",
    licensing: "Licensing Marketplace",
    usage: "Streaming & Oracle Telemetry",
    royalties: "Royalty Calculation & Payouts",
    history: "Blockchain Transaction Ledger"
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {titles[activeTab] || "Dashboard"}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Ethereum PoA Consortium • Decentralized Rights Protocol
          </p>
        </div>
      </div>

      {/* Right: Network Status, Royalty Pill & Sync */}
      <div className="flex items-center gap-3">
        {/* Network indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>EVM Node Active (31337)</span>
        </div>

        {/* Claim Royalty Pill */}
        <button
          onClick={() => setActiveTab("royalties")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition"
          title="Click to claim royalties"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span>Royalty:</span>
          <span className="font-mono font-bold">{walletInfo.pendingRoyaltyEth} ETH</span>
        </button>

        {/* Refresh Sync Button */}
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition ${
            refreshing ? "animate-spin text-indigo-600" : ""
          }`}
          title="Sync blockchain data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
