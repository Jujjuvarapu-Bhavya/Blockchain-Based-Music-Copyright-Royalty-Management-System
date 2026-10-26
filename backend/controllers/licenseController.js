const db = require("../models/dbAdapter");
const blockchainService = require("../services/blockchainService");

exports.createLicense = async (req, res) => {
  try {
    const { songId, licensee, durationDays, licenseType, feeEth } = req.body;

    if (!songId || !licensee || !durationDays || !licenseType) {
      return res.status(400).json({ success: false, message: "Missing required license fields" });
    }

    const song = db.findOne("songs", { songId });
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    const licenseId = "LIC_" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Call blockchain
    const onChainResult = await blockchainService.createLicense({
      licenseId,
      songId,
      licensee,
      durationDays: Number(durationDays),
      licenseType,
      feeEth: feeEth || 0,
      fromAddress: licensee
    });

    const newLicense = db.insert("licenses", {
      licenseId,
      songId,
      songTitle: song.title,
      licensee,
      durationDays: Number(durationDays),
      licenseType,
      feeEth: feeEth || 0,
      startDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber
    });

    db.logAudit(
      "LICENSE_CREATED",
      licensee,
      `Acquired ${licenseType} license for song ${songId} ('${song.title}') for ${durationDays} days. Fee: ${feeEth || 0} ETH`,
      onChainResult.txHash
    );

    res.status(201).json({
      success: true,
      message: "License issued and recorded on blockchain",
      license: newLicense,
      onChainResult
    });
  } catch (error) {
    console.error("Error creating license:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLicenses = (req, res) => {
  try {
    const { songId } = req.query;
    const licenses = songId ? db.find("licenses", { songId }) : db.getCollection("licenses");
    res.json({ success: true, licenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
