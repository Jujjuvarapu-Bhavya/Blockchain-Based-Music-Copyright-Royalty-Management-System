const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
const dbFilePath = path.join(dataDir, "database.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pre-seeded demo users mapped to Hardhat standard test accounts
const initialData = {
  users: [
    {
      id: "usr_admin",
      username: "admin",
      name: "Admin / Validator",
      role: "Admin",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      email: "admin@musicchain.org"
    },
    {
      id: "usr_artist",
      username: "artist_elena",
      name: "Elena Vance (Artist)",
      role: "Artist",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      email: "elena@vancemusic.com"
    },
    {
      id: "usr_composer",
      username: "composer_marcus",
      name: "Marcus Cole (Composer)",
      role: "Composer",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      email: "marcus@soundworks.io"
    },
    {
      id: "usr_lyricist",
      username: "lyricist_sarah",
      name: "Sarah Jenkins (Lyricist)",
      role: "Lyricist",
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      email: "sarah@lyriclab.com"
    },
    {
      id: "usr_platform",
      username: "spotify_node",
      name: "SoundStream Global (Licensee / Platform)",
      role: "Licensee",
      walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      email: "licensing@soundstream.com"
    },
    {
      id: "usr_authority",
      username: "global_rights_office",
      name: "Global Copyright Authority",
      role: "Copyright Authority",
      walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
      email: "certify@copyrightauthority.gov"
    }
  ],
  songs: [],
  licenses: [],
  usageRecords: [],
  royaltyDistributions: [],
  auditLogs: []
};

class DatabaseAdapter {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
    }
  }

  _read() {
    try {
      const content = fs.readFileSync(dbFilePath, "utf8");
      return JSON.parse(content);
    } catch (err) {
      console.error("Error reading DB file, recreating defaults:", err);
      return initialData;
    }
  }

  _write(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  }

  getCollection(name) {
    const data = this._read();
    return data[name] || [];
  }

  find(collectionName, query = {}) {
    const items = this.getCollection(collectionName);
    return items.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  insert(collectionName, item) {
    const data = this._read();
    if (!data[collectionName]) {
      data[collectionName] = [];
    }
    const record = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data[collectionName].push(record);
    this._write(data);
    return record;
  }

  update(collectionName, query, updates) {
    const data = this._read();
    if (!data[collectionName]) return 0;

    let updatedCount = 0;
    data[collectionName] = data[collectionName].map(item => {
      let matches = true;
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    this._write(data);
    return updatedCount;
  }

  logAudit(action, actor, details, txHash = null) {
    return this.insert("auditLogs", {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action,
      actor,
      details,
      txHash,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new DatabaseAdapter();
