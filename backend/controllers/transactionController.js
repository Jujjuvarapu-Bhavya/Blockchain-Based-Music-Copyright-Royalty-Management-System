const db = require("../models/dbAdapter");

exports.getTransactions = (req, res) => {
  try {
    const logs = db.getCollection("auditLogs");
    // Sort descending by timestamp
    const sorted = [...logs].reverse();
    res.json({
      success: true,
      totalCount: sorted.length,
      transactions: sorted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemStats = (req, res) => {
  try {
    const songs = db.getCollection("songs");
    const licenses = db.getCollection("licenses");
    const usageRecords = db.getCollection("usageRecords");
    const distributions = db.getCollection("royaltyDistributions");
    const auditLogs = db.getCollection("auditLogs");

    const totalStreams = usageRecords.reduce((sum, u) => sum + (Number(u.streamCount) || 0), 0);
    const totalRoyaltiesEth = distributions.reduce((sum, d) => sum + (Number(d.amountEth) || 0), 0);

    res.json({
      success: true,
      stats: {
        songsCount: songs.length,
        verifiedSongsCount: songs.filter(s => s.status === "Verified").length,
        licensesCount: licenses.length,
        totalStreams,
        totalRoyaltiesEth: totalRoyaltiesEth.toFixed(4),
        totalTransactions: auditLogs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
