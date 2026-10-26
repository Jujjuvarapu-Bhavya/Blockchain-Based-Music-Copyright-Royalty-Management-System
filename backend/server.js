const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const apiRoutes = require("./routes/api");
const blockchainService = require("./services/blockchainService");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded audio and static assets
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Mount REST API
app.use("/api", apiRoutes);

// Root health check
app.get("/", (req, res) => {
  res.json({
    project: "Blockchain-Based Music Copyright & Royalty Management REST API",
    status: "online",
    timestamp: new Date().toISOString(),
    blockchainStatus: blockchainService.getStatus(),
    endpoints: {
      auth: "/api/auth/users",
      songs: "/api/songs",
      copyrightRegistry: "/api/copyrights/registry",
      licenses: "/api/licenses",
      usage: "/api/usage",
      royalties: "/api/royalties/calculate",
      transactions: "/api/transactions",
      stats: "/api/stats"
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(` Music Copyright & Royalty Backend API running on port ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/stats`);
  console.log(`=======================================================`);
});
