const db = require("../models/dbAdapter");
const blockchainService = require("../services/blockchainService");

exports.verifyCopyright = async (req, res) => {
  try {
    const { songId } = req.params;
    const authorityWallet = req.body.authorityWallet || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const song = db.findOne("songs", { songId });
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    const onChainResult = await blockchainService.verifySong(songId, authorityWallet);

    db.update("songs", { songId }, {
      status: "Verified",
      verifiedAt: new Date().toISOString(),
      verifiedBy: authorityWallet,
      verifyTxHash: onChainResult.txHash
    });

    db.logAudit(
      "COPYRIGHT_VERIFIED",
      authorityWallet,
      `Certified copyright for song ${songId} ('${song.title}')`,
      onChainResult.txHash
    );

    res.json({
      success: true,
      message: `Song ${songId} copyright officially certified and recorded on blockchain.`,
      onChainResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCopyrightRegistry = async (req, res) => {
  try {
    const songs = db.getCollection("songs");
    const verifiedCount = songs.filter(s => s.status === "Verified").length;
    const totalRightsHolders = songs.reduce((sum, s) => sum + (s.rightsHolders ? s.rightsHolders.length : 0), 0);

    res.json({
      success: true,
      stats: {
        totalWorks: songs.length,
        verifiedWorks: verifiedCount,
        totalRightsHolders
      },
      songs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
