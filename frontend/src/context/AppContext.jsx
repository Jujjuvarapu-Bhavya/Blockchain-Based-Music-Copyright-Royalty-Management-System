import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletInfo, setWalletInfo] = useState({
    pendingRoyaltyEth: "0.0",
    totalWithdrawnEth: "0.0",
    nativeBalanceEth: "0.0"
  });
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        if (!currentUser && data.users.length > 0) {
          // Default to artist
          const artist = data.users.find(u => u.role === "Artist") || data.users[0];
          setCurrentUser(artist);
        }
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      if (data.success) {
        setSongs(data.songs);
      }
    } catch (e) {
      console.error("Failed to fetch songs:", e);
    }
  };

  const fetchLicenses = async () => {
    try {
      const res = await fetch("/api/licenses");
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses);
      }
    } catch (e) {
      console.error("Failed to fetch licenses:", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
    }
  };

  const fetchBlockchainStatus = async () => {
    try {
      const res = await fetch("/api/blockchain/status");
      const data = await res.json();
      setBlockchainStatus(data);
    } catch (e) {
      console.error("Failed to fetch blockchain status:", e);
    }
  };

  const fetchWalletDetails = async (walletAddress) => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`/api/royalties/wallet/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setWalletInfo({
          pendingRoyaltyEth: data.pendingWithdrawalEth || "0.0",
          totalWithdrawnEth: data.totalWithdrawnEth || "0.0",
          nativeBalanceEth: data.nativeBalanceEth || "0.0"
        });
      }
    } catch (e) {
      console.error("Failed to fetch wallet info:", e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchSongs(),
      fetchLicenses(),
      fetchStats(),
      fetchTransactions(),
      fetchBlockchainStatus()
    ]);
    if (currentUser?.walletAddress) {
      await fetchWalletDetails(currentUser.walletAddress);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchLicenses();
    fetchStats();
    fetchTransactions();
    fetchBlockchainStatus();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser?.walletAddress) {
      fetchWalletDetails(currentUser.walletAddress);
    }
  }, [currentUser]);

  const switchUser = (user) => {
    setCurrentUser(user);
    addToast("info", "Switched Identity", `Now operating as ${user.name} (${user.role})`);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        switchUser,
        songs,
        licenses,
        stats,
        transactions,
        loading,
        walletInfo,
        blockchainStatus,
        refreshAll,
        addToast,
        toasts,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
