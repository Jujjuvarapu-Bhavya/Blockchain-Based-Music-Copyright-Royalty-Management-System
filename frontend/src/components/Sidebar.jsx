import React from "react";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Music,
  Shield,
  ShoppingBag,
  Radio,
  Coins,
  History,
  Workflow,
  Sparkles,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, onOpenDiagram, mobileOpen, setMobileOpen }) {
  const { currentUser, users, switchUser, walletInfo } = useApp();

  const navigation = [
    {
      group: "MAIN",
      items: [
        { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      group: "COPYRIGHT & WORKS",
      items: [
        { id: "register", label: "Register Work", icon: <Music className="w-4 h-4" /> },
        { id: "registry", label: "Copyright Registry", icon: <Shield className="w-4 h-4" /> }
      ]
    },
    {
      group: "LICENSING & TELEMETRY",
      items: [
        { id: "licensing", label: "Licensing Market", icon: <ShoppingBag className="w-4 h-4" /> },
        { id: "usage", label: "Streams & Oracle", icon: <Radio className="w-4 h-4" /> }
      ]
    },
    {
      group: "FINANCE & AUDIT",
      items: [
        { id: "royalties", label: "Royalty Payouts", icon: <Coins className="w-4 h-4" /> },
        { id: "history", label: "Audit Ledger", icon: <History className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">MusicChain</span>
              <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider">
                Copyright Protocol
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navigation.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                  {section.group}
                </p>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Flowchart & Active Persona */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* How It Works Button */}
          <button
            onClick={onOpenDiagram}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-600" />
              <span>Lifecycle Flowchart</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Active Persona Box */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Identity
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-[10px] font-mono text-slate-400 truncate mb-2">
              {currentUser?.walletAddress}
            </p>

            {/* Quick Switch Dropdown */}
            <select
              value={currentUser?.id || ""}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) switchUser(selected);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  Switch to: {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    </>
  );
}
