import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Music,
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Radio,
  Coins,
  History,
  Workflow,
  ChevronDown,
  User,
  Wallet
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenDiagram }) {
  const { users, currentUser, switchUser, walletInfo } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "register", label: "Register Song", icon: <Music className="w-4 h-4" /> },
    { id: "registry", label: "Copyrights", icon: <Shield className="w-4 h-4" /> },
    { id: "licensing", label: "Licenses", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "usage", label: "Streams & Oracle", icon: <Radio className="w-4 h-4" /> },
    { id: "royalties", label: "Royalties", icon: <Coins className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <History className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base">MusicChain</span>
              <span className="text-xs text-slate-500 block -mt-0.5">Copyright & Royalties</span>
            </div>
          </div>

          {/* Simple Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: State Diagram & Role Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDiagram}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Workflow className="w-3.5 h-3.5 text-indigo-600" />
              <span>How it Works</span>
            </button>

            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-800 transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser ? currentUser.name[0] : "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-bold uppercase">
                    {currentUser?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Actor / Role
                    </p>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                          currentUser?.id === u.id
                            ? "bg-indigo-50 font-bold text-indigo-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.role}</div>
                        </div>
                        {currentUser?.id === u.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Wallet Royalty preview */}
                  <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1.5 bg-slate-50 rounded-lg text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Available Royalty:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        {walletInfo.pendingRoyaltyEth} ETH
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 -mx-4 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
