import React from "react";
import { X, CheckCircle2, ArrowRight, ShieldCheck, PlayCircle, Radio, DollarSign, Layers } from "lucide-react";

export default function StateDiagramModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const steps = [
    {
      num: "1",
      title: "Song Registered",
      desc: "Creator registers song; smart contract checks contributor percentages equal exactly 100%.",
      icon: <Layers className="w-5 h-5 text-indigo-600" />
    },
    {
      num: "2",
      title: "Copyright Verified",
      desc: "Copyright Authority certifies the work on the blockchain to prevent disputes.",
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />
    },
    {
      num: "3",
      title: "Song Licensed",
      desc: "Music platform or licensee acquires a commercial usage license.",
      icon: <PlayCircle className="w-5 h-5 text-emerald-600" />
    },
    {
      num: "4",
      title: "Usage Verified (Oracle)",
      desc: "Streaming plays from Spotify/Apple are verified and submitted to the blockchain via Oracle.",
      icon: <Radio className="w-5 h-5 text-amber-600" />
    },
    {
      num: "5",
      title: "Royalty Calculated",
      desc: "Smart contract applies exact percentage shares: (Revenue × Contributor %) / 100.",
      icon: <DollarSign className="w-5 h-5 text-purple-600" />
    },
    {
      num: "6",
      title: "Distribution & Payout",
      desc: "Royalties credited on-chain; rights holders withdraw ETH directly into their wallets.",
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Music Copyright & Royalty Flow
            </h3>
            <p className="text-xs text-slate-500">
              Step-by-step lifecycle from registration to royalty payout
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200">
                  STEP {s.num}
                </span>
                {s.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          >
            Close Flowchart
          </button>
        </div>
      </div>
    </div>
  );
}
