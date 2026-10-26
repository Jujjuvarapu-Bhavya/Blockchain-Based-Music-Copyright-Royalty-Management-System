import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Coins,
  Calculator,
  Download,
  Wallet,
  ArrowRight
} from "lucide-react";

export default function RoyaltyManagement() {
  const { songs, currentUser, walletInfo, refreshAll, addToast } = useApp();

  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.songId || "");
  const [distributeAmountEth, setDistributeAmountEth] = useState("1.0");
  const [calcAmountEth, setCalcAmountEth] = useState("1.0");
  const [calculationResult, setCalculationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const runCalculation = async () => {
    if (!selectedSongId || !calcAmountEth) return;
    try {
      const res = await fetch("/api/royalties/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: selectedSongId,
          totalAmountEth: calcAmountEth
        })
      });
      const data = await res.json();
      if (data.success) {
        setCalculationResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedSongId) {
      runCalculation();
    }
  }, [selectedSongId, calcAmountEth, songs]);

  const handleDistribute = async (e) => {
    e.preventDefault();
    if (!selectedSongId || !distributeAmountEth) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/royalties/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: selectedSongId,
          amountEth: distributeAmountEth,
          senderWallet: currentUser?.walletAddress
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to distribute");
      }

      addToast("success", "Royalties Distributed", `Deposited ${distributeAmountEth} ETH into smart contract.`);
      await refreshAll();
    } catch (err) {
      addToast("error", "Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (Number(walletInfo.pendingRoyaltyEth || 0) <= 0) {
      addToast("warning", "Zero Balance", "No pending royalties available to withdraw");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch("/api/royalties/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: currentUser?.walletAddress
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to withdraw");
      }

      addToast("success", "Payout Transferred", `Withdrew ${walletInfo.pendingRoyaltyEth} ETH to ${currentUser.name}'s wallet!`);
      await refreshAll();
    } catch (err) {
      addToast("error", "Withdrawal Error", err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Coins className="w-6 h-6 text-indigo-600" />
          Royalty Management & Payouts
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Calculate, deposit, and withdraw automated cryptocurrency royalties based on registered shares.
        </p>
      </div>

      {/* Claim Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-800">
            Active Persona: {currentUser?.name} ({currentUser?.role})
          </div>
          <div className="text-xl font-bold text-emerald-950 mt-1">
            Available Withdrawable Balance
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">
            {walletInfo.pendingRoyaltyEth} ETH
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={withdrawing || Number(walletInfo.pendingRoyaltyEth || 0) <= 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
            Number(walletInfo.pendingRoyaltyEth || 0) > 0 && !withdrawing
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Download className="w-4 h-4" />
          {withdrawing ? "Processing Withdrawal..." : "Withdraw Royalties"}
        </button>
      </div>

      {/* 2 Columns: Calculator & Deposit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            Royalty Split Calculator
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Song</label>
              <select
                value={selectedSongId}
                onChange={(e) => setSelectedSongId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
              >
                {songs.map((s) => (
                  <option key={s.songId} value={s.songId}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Revenue (ETH)</label>
              <input
                type="number"
                step="0.5"
                value={calcAmountEth}
                onChange={(e) => setCalcAmountEth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block">
              Calculated Contributor Cuts:
            </span>

            {calculationResult?.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="text-[11px] text-slate-500 block">{item.role} ({item.sharePercentage}%)</span>
                </div>
                <div className="text-right font-mono font-bold text-emerald-600 text-sm">
                  {item.amountEth} ETH
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deposit Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              Deposit & Distribute Royalties
            </h3>
            <p className="text-xs text-slate-500">
              Music platforms deposit revenue into the smart contract. The contract credits each contributor's account immediately.
            </p>

            <form onSubmit={handleDistribute} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Song</label>
                <select
                  value={selectedSongId}
                  onChange={(e) => setSelectedSongId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
                >
                  {songs.map((s) => (
                    <option key={s.songId} value={s.songId}>
                      {s.title} ({s.songId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount to Distribute (ETH)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={distributeAmountEth}
                  onChange={(e) => setDistributeAmountEth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition mt-2"
              >
                {submitting ? "Distributing on Chain..." : "Deposit & Distribute ETH"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
