import React from "react";
import { useApp } from "../context/AppContext";
import {
  Music,
  ShieldCheck,
  ShoppingBag,
  Radio,
  Coins,
  ArrowRight,
  Plus,
  CheckCircle,
  ExternalLink,
  Wallet
} from "lucide-react";

export default function Dashboard({ setActiveTab, onOpenDiagram }) {
  const { stats, currentUser, songs, transactions, walletInfo } = useApp();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            Operating as: {currentUser?.role}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Register your music works, manage copyright splits, license tracks, and track royalties on the blockchain.
          </p>
        </div>

        {/* Claim Balance Callout */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 self-start md:self-auto">
          <div>
            <div className="text-xs text-slate-500">Your Withdrawable Royalty</div>
            <div className="text-xl font-bold text-emerald-600 font-mono">
              {walletInfo.pendingRoyaltyEth} ETH
            </div>
          </div>
          <button
            onClick={() => setActiveTab("royalties")}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
          >
            Claim Payout
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Registered Songs</span>
            <Music className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.songsCount || 0}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active works</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Certified Copyrights</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.verifiedSongsCount || 0}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Authority verified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Streams</span>
            <Radio className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {Number(stats?.totalStreams || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Oracle verified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Royalties Distributed</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {stats?.totalRoyaltiesEth || "0.0"} ETH
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Paid out</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab("register")}
          className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Song
        </button>

        <button
          onClick={() => setActiveTab("registry")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          View Copyrights
        </button>

        <button
          onClick={() => setActiveTab("usage")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Radio className="w-4 h-4 text-amber-600" />
          Log Streams (Oracle)
        </button>

        <button
          onClick={() => setActiveTab("royalties")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Coins className="w-4 h-4 text-emerald-600" />
          Royalty Calculator
        </button>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Songs List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Registered Works</h3>
            <button
              onClick={() => setActiveTab("registry")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {songs.slice(0, 4).map((s) => (
              <div
                key={s.songId}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{s.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      s.status === "Verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ID: <span className="font-mono">{s.songId}</span> • {s.genre} • {Number(s.totalStreams || 0).toLocaleString()} streams
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800 block">
                    {s.totalRoyaltyPaidEth || "0.0"} ETH
                  </span>
                  <span className="text-[10px] text-slate-400">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Recent Blockchain Activity</h3>
            <button
              onClick={() => setActiveTab("history")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id || tx.txHash}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {tx.action.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 truncate">{tx.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
