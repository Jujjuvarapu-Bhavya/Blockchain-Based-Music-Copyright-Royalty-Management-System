import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ToastContainer from "./components/ToastContainer";
import StateDiagramModal from "./components/StateDiagramModal";

import Dashboard from "./pages/Dashboard";
import MusicRegistration from "./pages/MusicRegistration";
import CopyrightRegistry from "./pages/CopyrightRegistry";
import LicensingMarketplace from "./pages/LicensingMarketplace";
import UsageTracking from "./pages/UsageTracking";
import RoyaltyManagement from "./pages/RoyaltyManagement";
import TransactionHistory from "./pages/TransactionHistory";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} onOpenDiagram={() => setDiagramOpen(true)} />;
      case "register":
        return <MusicRegistration setActiveTab={setActiveTab} />;
      case "registry":
        return <CopyrightRegistry setActiveTab={setActiveTab} />;
      case "licensing":
        return <LicensingMarketplace setActiveTab={setActiveTab} />;
      case "usage":
        return <UsageTracking setActiveTab={setActiveTab} />;
      case "royalties":
        return <RoyaltyManagement setActiveTab={setActiveTab} />;
      case "history":
        return <TransactionHistory setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} onOpenDiagram={() => setDiagramOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDiagram={() => setDiagramOpen(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace (Offset for Sidebar on Large Screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MusicChain • Blockchain-Based Music Copyright & Royalty Protocol</span>
            <span className="font-mono text-[11px] text-slate-400">
              Solidity ^0.8.20 • Ethereum EVM • IPFS SHA-256 • Oracle Attestation
            </span>
          </div>
        </footer>
      </div>

      {/* State Flow Lifecycle Diagram Modal */}
      <StateDiagramModal isOpen={diagramOpen} onClose={() => setDiagramOpen(false)} />

      {/* Global Alerts Overlay */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
