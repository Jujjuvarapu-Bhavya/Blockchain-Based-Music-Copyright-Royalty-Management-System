import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Music,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function MusicRegistration({ setActiveTab }) {
  const { currentUser, users, refreshAll, addToast } = useApp();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Pop / Electronic");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("3:30");
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Standard demo split: 50% Artist, 30% Composer, 20% Lyricist
  const [rightsHolders, setRightsHolders] = useState([
    {
      name: "Elena Vance",
      wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      role: "Artist",
      sharePercentage: 50
    },
    {
      name: "Marcus Cole",
      wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      role: "Composer",
      sharePercentage: 30
    },
    {
      name: "Sarah Jenkins",
      wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      role: "Lyricist",
      sharePercentage: 20
    }
  ]);

  const totalSharePercentage = rightsHolders.reduce(
    (sum, h) => sum + (Number(h.sharePercentage) || 0),
    0
  );
  const isSharesValid = Math.round(totalSharePercentage) === 100;

  const handleAddHolder = () => {
    setRightsHolders([
      ...rightsHolders,
      {
        name: `Contributor ${rightsHolders.length + 1}`,
        wallet: "0x0000000000000000000000000000000000000000",
        role: "Producer",
        sharePercentage: 0
      }
    ]);
  };

  const handleRemoveHolder = (idx) => {
    if (rightsHolders.length <= 1) return;
    const updated = [...rightsHolders];
    updated.splice(idx, 1);
    setRightsHolders(updated);
  };

  const handleHolderChange = (idx, field, value) => {
    const updated = [...rightsHolders];
    updated[idx] = { ...updated[idx], [field]: value };
    setRightsHolders(updated);
  };

  const loadPreset = () => {
    setRightsHolders([
      {
        name: "Elena Vance",
        wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        role: "Artist",
        sharePercentage: 50
      },
      {
        name: "Marcus Cole",
        wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        role: "Composer",
        sharePercentage: 30
      },
      {
        name: "Sarah Jenkins",
        wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        role: "Lyricist",
        sharePercentage: 20
      }
    ]);
    addToast("info", "Preset Applied", "Set shares to 50% Artist, 30% Composer, 20% Lyricist (Total: 100%)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("warning", "Required Field", "Please enter a song title");
      return;
    }

    if (!isSharesValid) {
      addToast(
        "error",
        "Invalid Split Percentage",
        `Total royalty shares must equal 100%. Current total is ${totalSharePercentage}%.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("creatorWallet", currentUser?.walletAddress || rightsHolders[0].wallet);
      formData.append("rightsHolders", JSON.stringify(rightsHolders));
      if (audioFile) {
        formData.append("audio", audioFile);
      }

      const res = await fetch("/api/songs", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to register song");
      }

      addToast("success", "Success!", `'${title}' was registered on the blockchain.`);
      await refreshAll();
      setActiveTab("registry");
    } catch (err) {
      addToast("error", "Registration Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-indigo-600" />
            Register Music Copyright
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Record ownership, audio hash, and royalty percentages on the blockchain.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPreset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load 50/30/20 Preset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Song Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">1. Song Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Song Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dream Music"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Electronic, Pop, Classical..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3:45"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Audio File (Optional)</label>
              <div className="border border-dashed border-slate-300 hover:border-indigo-600 rounded-xl p-4 text-center cursor-pointer bg-slate-50">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0] || null)}
                  className="hidden"
                />
                <label htmlFor="audio-upload" className="cursor-pointer space-y-1 block">
                  <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
                  <p className="text-xs font-medium text-slate-700">
                    {audioFile ? audioFile.name : "Click to select MP3 or audio file"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    SHA-256 IPFS hash will be generated automatically
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Ownership Splits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">2. Contributor Ownership & Royalty Splits</h3>
              <p className="text-xs text-slate-500">Percentages must sum to exactly 100%.</p>
            </div>

            {/* Split status pill */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isSharesValid
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}>
              {isSharesValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Total: 100% (Valid)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Total: {totalSharePercentage}% (Must be 100%)</span>
                </>
              )}
            </div>
          </div>

          {/* Simple Contributor Rows */}
          <div className="space-y-3">
            {rightsHolders.map((holder, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <span className="font-semibold text-slate-600 block mb-1">Name</span>
                  <input
                    type="text"
                    value={holder.name}
                    onChange={(e) => handleHolderChange(idx, "name", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <span className="font-semibold text-slate-600 block mb-1">Role</span>
                  <select
                    value={holder.role}
                    onChange={(e) => handleHolderChange(idx, "role", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Artist">Artist</option>
                    <option value="Composer">Composer</option>
                    <option value="Lyricist">Lyricist</option>
                    <option value="Producer">Producer</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <span className="font-semibold text-slate-600 block mb-1">Wallet Address</span>
                  <input
                    type="text"
                    value={holder.wallet}
                    onChange={(e) => handleHolderChange(idx, "wallet", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-mono bg-white text-[11px]"
                  />
                </div>

                <div className="sm:col-span-1">
                  <span className="font-semibold text-slate-600 block mb-1">Share %</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={holder.sharePercentage}
                    onChange={(e) => handleHolderChange(idx, "sharePercentage", Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-bold text-center bg-white"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveHolder(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddHolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Add Another Contributor
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isSharesValid || submitting}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition ${
              isSharesValid && !submitting
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting ? "Registering on Blockchain..." : "Register Song on Blockchain"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
