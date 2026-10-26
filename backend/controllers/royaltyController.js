const db = require("../models/dbAdapter");
const blockchainService = require("../services/blockchainService");

exports.calculateRoyalty = async (req, res) => {
  try {
    const { songId, totalAmountEth } = req.body;
    if (!songId || !totalAmountEth) {
      return res.status(400).json({ success: false, message: "songId and totalAmountEth required" });
    }

    const song = db.findOne("songs", { songId });
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    // Try calculating on-chain via smart contract
    let calculation;
    try {
      calculation = await blockchainService.calculateRoyalty(songId, totalAmountEth);
    } catch {
      calculation = null;
    }

    // Fallback or augment with rights holders info
    const breakdown = (song.rightsHolders || []).map((holder, idx) => {
      const shareFraction = (holder.sharePercentage || 0) / 100;
      const amountEth = (Number(totalAmountEth) * shareFraction).toFixed(6);
      return {
        name: holder.name,
        wallet: holder.wallet,
        role: holder.role,
        sharePercentage: holder.sharePercentage,
        amountEth: calculation && calculation.amountsEth[idx] ? calculation.amountsEth[idx] : amountEth
      };
    });

    res.json({
      success: true,
      songId,
      title: song.title,
      totalAmountEth,
      breakdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.distributeRoyalty = async (req, res) => {
  try {
    const { songId, amountEth, senderWallet } = req.body;

    if (!songId || !amountEth || Number(amountEth) <= 0) {
      return res.status(400).json({ success: false, message: "Valid songId and amountEth > 0 required" });
    }

    const song = db.findOne("songs", { songId });
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    const payer = senderWallet || "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"; // Default licensee
    const onChainResult = await blockchainService.distributeRoyalty({
      songId,
      amountEth,
      fromAddress: payer
    });

    // Record distribution record in database
    const distRecord = db.insert("royaltyDistributions", {
      distributionId: "DIST_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      songId,
      songTitle: song.title,
      amountEth: Number(amountEth),
      distributorWallet: payer,
      timestamp: new Date().toISOString(),
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber
    });

    // Update song cumulative royalty
    const currentTotal = Number(song.totalRoyaltyPaidEth || 0);
    db.update("songs", { songId }, {
      totalRoyaltyPaidEth: (currentTotal + Number(amountEth)).toFixed(4)
    });

    db.logAudit(
      "ROYALTY_DISTRIBUTED",
      payer,
      `Distributed ${amountEth} ETH in royalties for song ${songId} ('${song.title}') across rights holders`,
      onChainResult.txHash
    );

    res.json({
      success: true,
      message: `Successfully distributed ${amountEth} ETH in royalties on-chain`,
      distribution: distRecord,
      onChainResult
    });
  } catch (error) {
    console.error("Error distributing royalty:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWalletRoyalty = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: "walletAddress required" });
    }

    const info = await blockchainService.getWalletRoyaltyInfo(walletAddress);
    res.json({ success: true, wallet: walletAddress, ...info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawRoyalty = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: "walletAddress required" });
    }

    const onChainResult = await blockchainService.withdrawRoyalty(walletAddress);

    db.logAudit(
      "ROYALTY_WITHDRAWN",
      walletAddress,
      `Withdrew ${onChainResult.amountEth || 0} ETH accumulated royalty share`,
      onChainResult.txHash
    );

    res.json({
      success: true,
      message: `Royalty withdrawal processed successfully`,
      onChainResult
    });
  } catch (error) {
    console.error("Error withdrawing royalty:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
