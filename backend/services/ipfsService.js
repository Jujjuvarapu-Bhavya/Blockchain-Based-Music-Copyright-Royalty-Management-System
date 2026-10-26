const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

class IPFSService {
  /**
   * Generates a deterministic simulated IPFS CIDv0/v1 string from a file buffer or object
   */
  generateCID(bufferOrObject) {
    const data = Buffer.isBuffer(bufferOrObject)
      ? bufferOrObject
      : Buffer.from(typeof bufferOrObject === "string" ? bufferOrObject : JSON.stringify(bufferOrObject));

    const hash = crypto.createHash("sha256").update(data).digest("hex");
    // Standard IPFS Base58 / multihash preview format: "Qm" + 44 characters
    const simulatedCid = "Qm" + hash.substring(0, 44);
    return {
      cid: simulatedCid,
      sha256: hash,
      sizeBytes: data.length
    };
  }

  /**
   * Pins audio file and its metadata
   */
  pinSongFile(fileBuffer, metadata) {
    const fileResult = this.generateCID(fileBuffer);
    const metadataBundle = {
      ...metadata,
      audioCid: fileResult.cid,
      audioSha256: fileResult.sha256,
      audioSizeBytes: fileResult.sizeBytes,
      pinnedAt: new Date().toISOString()
    };

    const metadataResult = this.generateCID(metadataBundle);

    return {
      audioCid: fileResult.cid,
      metadataCid: metadataResult.cid,
      sha256: fileResult.sha256,
      metadataBundle
    };
  }
}

module.exports = new IPFSService();
