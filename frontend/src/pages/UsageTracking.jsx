import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Radio,
  CheckCircle2,
  Cpu,
  ArrowRight
} from "lucide-react";

export default function UsageTracking() {
  const { songs, refreshAll, addToast } = useApp();

  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.songId || "");
  const [platform, setPlatform] = useState("Spotify");
  const [streamCount, setStreamCount] = useState(50000);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();
      if (data.success) {
        setLogs(data.records || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSimulateStreams = async (e) => {
    e.preventDefault();
    if (!selectedSongId) {
      addToast("warning", "Select Song", "Please select a song first");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/usage/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: selectedSongId,
          platformName: platform,
          streamCount: Number(streamCount)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record");
      }

      addToast("success", "Streams Logged", `Recorded ${Number(streamCount).toLocaleString()} plays via Oracle.`);
      await fetchLogs();
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
          <Radio className="w-6 h-6 text-indigo-600" />
          Streaming Usage & Oracle Telemetry
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Simulate verified stream counts from Spotify and Apple Music verified by Oracle into the smart contract.
        </p>
      </div>

      {/* Simulator Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          Log Streaming Play Counts
        </h3>

        <form onSubmit={handleSimulateStreams} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Song</label>
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
              <label className="font-semibold text-slate-700 block mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
              >
                <option value="Spotify">Spotify</option>
                <option value="Apple Music">Apple Music</option>
                <option value="YouTube Music">YouTube Music</option>
                <option value="Amazon Music">Amazon Music</option>
                <option value="Tidal">Tidal</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Number of Streams</label>
              <input
                type="number"
                step="5000"
                min="1000"
                value={streamCount}
                onChange={(e) => setStreamCount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition"
            >
              {submitting ? "Signing & Submitting..." : "Send Streams via Oracle"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Stream History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Verified Stream Records ({logs.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Song ID</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Streams Verified</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...logs].reverse().map((log) => (
                <tr key={log.usageId}>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{log.songId}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{log.platformName}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-600">
                    {Number(log.streamCount).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Oracle Verified
                    </span>
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
