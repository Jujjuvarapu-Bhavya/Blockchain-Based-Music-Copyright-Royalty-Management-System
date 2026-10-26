import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Shield,
  ShieldCheck,
  Search,
  Award,
  Users,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function CopyrightRegistry({ setActiveTab }) {
  const { songs, currentUser, refreshAll, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.songId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCertify = currentUser?.role === "Copyright Authority" || currentUser?.role === "Admin";

  const handleVerify = async (songId) => {
    setVerifyingId(songId);
    try {
      const res = await fetch(`/api/copyrights/verify/${songId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorityWallet: currentUser?.walletAddress })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to certify");
      }
      addToast("success", "Certified!", `Song ${songId} officially certified by Copyright Authority.`);
      await refreshAll();
    } catch (err) {
      addToast("error", "Error", err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Copyright Registry
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified music rights, contributor shares, and legal authority certifications.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by song title or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      {/* Role Tip */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>
            {canCertify
              ? `Signed in as [${currentUser?.name} (${currentUser?.role})]. You can certify pending works below.`
              : "To certify copyrights, switch active actor to 'Copyright Authority' in the top right menu."}
          </span>
        </div>
      </div>

      {/* Songs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((song) => {
          const isVerified = song.status === "Verified";

          return (
            <div
              key={song.songId}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {song.songId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{song.title}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isVerified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Certified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-3">
                  Genre: {song.genre} • Streams: {Number(song.totalStreams || 0).toLocaleString()}
                </div>

                {/* Contributor Splits */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Royalty Split Breakdown:
                  </span>
                  {(song.rightsHolders || []).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs px-2.5 py-1 rounded bg-slate-50 text-slate-700"
                    >
                      <span>{h.name} ({h.role}):</span>
                      <span className="font-bold text-slate-900">{h.sharePercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  CID: {song.ipfsAudioCid ? song.ipfsAudioCid.substring(0, 14) + "..." : "Recorded"}
                </span>

                {!isVerified && canCertify && (
                  <button
                    onClick={() => handleVerify(song.songId)}
                    disabled={verifyingId === song.songId}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {verifyingId === song.songId ? "Certifying..." : "Certify Copyright"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
