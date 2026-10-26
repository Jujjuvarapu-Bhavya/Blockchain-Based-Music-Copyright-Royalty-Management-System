const oracleService = require("../services/oracleService");
const db = require("../models/dbAdapter");

exports.recordUsage = async (req, res) => {
  try {
    const { songId, platformName, streamCount, simulatedRevenueEth } = req.body;

    if (!songId || !platformName || !streamCount) {
      return res.status(400).json({ success: false, message: "songId, platformName and streamCount required" });
    }

    const result = await oracleService.processStreamTelemetry({
      songId,
      platformName,
      streamCount,
      simulatedRevenueEth
    });

    res.json({
      success: true,
      message: "Streaming telemetry validated by Oracle and recorded on blockchain",
      data: result
    });
  } catch (error) {
    console.error("Error recording usage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.simulateOracleSync = async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ success: false, message: "songId is required" });
    }

    const result = await oracleService.generateSimulatedStreamEvent(songId);

    res.json({
      success: true,
      message: "Simulated stream activity received, verified by Oracle, and written to blockchain",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsageHistory = (req, res) => {
  try {
    const { songId } = req.query;
    const records = songId ? db.find("usageRecords", { songId }) : db.getCollection("usageRecords");
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
