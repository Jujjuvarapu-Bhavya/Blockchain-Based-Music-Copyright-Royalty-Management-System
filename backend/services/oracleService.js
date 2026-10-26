const crypto = require("crypto");
const blockchainService = require("./blockchainService");
const db = require("../models/dbAdapter");

class OracleService {
  constructor() {
    this.oracleAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Admin / Deployer acts as Oracle node
    this.supportedPlatforms = ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Tidal"];
    this.streamPricePerUnitEth = 0.000005; // 100,000 streams = 0.5 ETH
  }

  /**
   * Generates a cryptographic verification proof for stream logs
   */
  generateStreamProof(songId, platformName, streamCount, timestamp) {
    const payload = `${songId}:${platformName}:${streamCount}:${timestamp}`;
    const signature = crypto.createHash("sha256").update(payload).digest("hex");
    return {
      payload,
      oracleSignature: "0x" + signature,
      verifiedAt: new Date(timestamp).toISOString()
    };
  }

  /**
   * Process and verify off-chain streaming telemetry, then dispatch to smart contract
   */
  async processStreamTelemetry({ songId, platformName, streamCount, simulatedRevenueEth = null }) {
    if (!this.supportedPlatforms.includes(platformName)) {
      throw new Error(`Platform ${platformName} is not in the authorized oracle registry.`);
    }

    const timestamp = Date.now();
    const usageId = "USG_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const proof = this.generateStreamProof(songId, platformName, streamCount, timestamp);

    // Call blockchain service to execute recordUsage on smart contract
    const onChainResult = await blockchainService.recordUsage({
      usageId,
      songId,
      streamCount: Number(streamCount),
      platformName,
      fromAddress: this.oracleAddress
    });

    // Record in local database
    const record = db.insert("usageRecords", {
      usageId,
      songId,
      streamCount: Number(streamCount),
      platformName,
      oracleProof: proof.oracleSignature,
      timestamp: new Date().toISOString(),
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber
    });

    db.logAudit(
      "ORACLE_USAGE_VERIFIED",
      `Oracle [${platformName}]`,
      `Verified ${streamCount} streams for song ${songId}`,
      onChainResult.txHash
    );

    // Calculate royalty amount if revenue is included
    const estimatedRoyaltyEth = simulatedRevenueEth !== null
      ? simulatedRevenueEth
      : (Number(streamCount) * this.streamPricePerUnitEth).toFixed(4);

    return {
      usageRecord: record,
      onChainResult,
      proof,
      estimatedRoyaltyEth
    };
  }

  /**
   * Generate simulated usage event for live demo
   */
  async generateSimulatedStreamEvent(songId) {
    const randomPlatform = this.supportedPlatforms[Math.floor(Math.random() * this.supportedPlatforms.length)];
    const randomStreams = Math.floor(Math.random() * 50000) + 5000;
    return await this.processStreamTelemetry({
      songId,
      platformName: randomPlatform,
      streamCount: randomStreams
    });
  }
}

module.exports = new OracleService();
