import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ShoppingBag,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";

export default function LicensingMarketplace() {
  const { songs, licenses, currentUser, refreshAll, addToast } = useApp();

  const [selectedSong, setSelectedSong] = useState(null);
  const [licenseType, setLicenseType] = useState("Commercial Streaming");
  const [durationDays, setDurationDays] = useState(365);
  const [feeEth, setFeeEth] = useState("0.5");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    if (!selectedSong) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: selectedSong.songId,
          licensee: currentUser?.walletAddress || "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
          durationDays: Number(durationDays),
          licenseType,
          feeEth: Number(feeEth)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create license");
      }

      addToast("success", "License Created", `Acquired ${licenseType} license. Fee distributed to rights holders.`);
      setSelectedSong(null);
      await refreshAll();
    } catch (err) {
      addToast("error", "Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-indigo-600" />
          Music Licensing
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          License music for commercial use. License fees are automatically paid to rights holders.
        </p>
      </div>

      {/* Available Songs */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Available Songs for Licensing</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {songs.map((song) => (
            <div
              key={song.songId}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {song.songId}
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-1">{song.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Genre: {song.genre}
                </div>
              </div>

              <button
                onClick={() => setSelectedSong(song)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                Get License
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Licenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Active Licenses ({licenses.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">License ID</th>
                <th className="py-2.5 px-3">Song</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Fee</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {licenses.map((lic) => (
                <tr key={lic.licenseId}>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{lic.licenseId}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{lic.songTitle}</td>
                  <td className="py-2.5 px-3 text-slate-600">{lic.licenseType}</td>
                  <td className="py-2.5 px-3 text-slate-600">{lic.durationDays} Days</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{lic.feeEth} ETH</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                License: {selectedSong.title}
              </h3>
              <button onClick={() => setSelectedSong(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">License Type</label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  <option value="Commercial Streaming">Commercial Streaming</option>
                  <option value="Synchronization">Sync (TV & Film)</option>
                  <option value="Broadcast">Radio & Broadcast</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fee (ETH)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={feeEth}
                    onChange={(e) => setFeeEth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Fee is automatically split among rights holders according to their registered percentages.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSong(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {submitting ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
