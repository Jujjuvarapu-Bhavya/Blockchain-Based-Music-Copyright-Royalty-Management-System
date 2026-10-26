const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authController = require("../controllers/authController");
const songController = require("../controllers/songController");
const copyrightController = require("../controllers/copyrightController");
const licenseController = require("../controllers/licenseController");
const usageController = require("../controllers/usageController");
const royaltyController = require("../controllers/royaltyController");
const transactionController = require("../controllers/transactionController");
const blockchainService = require("../services/blockchainService");

// Configure Multer for audio uploads
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "_" + Math.floor(Math.random() * 10000);
    cb(null, "track_" + unique + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Authentication & Users
router.get("/auth/users", authController.getUsers);
router.get("/auth/current", authController.getCurrentUser);
router.post("/auth/switch", authController.switchUser);

// Songs & Registration
router.post("/songs", upload.single("audio"), songController.registerSong);
router.get("/songs", songController.getAllSongs);
router.get("/songs/:songId", songController.getSongById);
router.get("/songs/audio/:filename", songController.streamAudio);

// Copyright Management
router.post("/copyrights/verify/:songId", copyrightController.verifyCopyright);
router.get("/copyrights/registry", copyrightController.getCopyrightRegistry);

// Licensing
router.post("/licenses", licenseController.createLicense);
router.get("/licenses", licenseController.getLicenses);

// Usage & Oracles
router.post("/usage/record", usageController.recordUsage);
router.post("/usage/simulate-oracle", usageController.simulateOracleSync);
router.get("/usage", usageController.getUsageHistory);

// Royalty
router.post("/royalties/calculate", royaltyController.calculateRoyalty);
router.post("/royalties/distribute", royaltyController.distributeRoyalty);
router.get("/royalties/wallet/:walletAddress", royaltyController.getWalletRoyalty);
router.post("/royalties/withdraw", royaltyController.withdrawRoyalty);

// Transactions & Audit Trail
router.get("/transactions", transactionController.getTransactions);
router.get("/stats", transactionController.getSystemStats);

// Blockchain status
router.get("/blockchain/status", (req, res) => {
  res.json({ success: true, ...blockchainService.getStatus() });
});
router.post("/blockchain/reload", async (req, res) => {
  const status = await blockchainService.reloadDeployment();
  res.json({ success: true, status });
});

module.exports = router;
