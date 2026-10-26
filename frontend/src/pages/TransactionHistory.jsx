import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  History,
  Search,
  CheckCircle2,
  Copy
} from "lucide-react";

export default function TransactionHistory() {
  const { transactions, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter((tx) =>
    tx.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.txHash && tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast("info", "Copied", "Hash copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Blockchain Transaction History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable chronological audit log of all registration, licensing, and payout transactions.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Summary</th>
                <th className="py-2.5 px-3">Tx Hash</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map((tx) => (
                <tr key={tx.id || tx.txHash} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {tx.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 text-xs">{tx.details}</td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]" title={tx.txHash}>
                    {tx.txHash ? tx.txHash.substring(0, 12) + "..." : "Recorded"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans whitespace-nowrap text-[11px]">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    {tx.txHash && (
                      <button
                        onClick={() => handleCopy(tx.txHash)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Copy Tx Hash"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
