const db = require("../models/dbAdapter");
const ipfsService = require("../services/ipfsService");
const blockchainService = require("../services/blockchainService");
const fs = require("fs");
const path = require("path");

exports.registerSong = async (req, res) => {
  try {
    const { title, genre, description, duration } = req.body;
    let rightsHolders = req.body.rightsHolders;

    if (typeof rightsHolders === "string") {
      try {
        rightsHolders = JSON.parse(rightsHolders);
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid rightsHolders format" });
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Song title is required" });
    }

    if (!rightsHolders || !Array.isArray(rightsHolders) || rightsHolders.length === 0) {
      return res.status(400).json({ success: false, message: "At least one rights holder is required" });
    }

    // Security Rule: Royalty shares must sum to exactly 100%
    const totalPercentage = rightsHolders.reduce((sum, h) => sum + Number(h.sharePercentage || 0), 0);
    if (Math.round(totalPercentage) !== 100) {
      return res.status(400).json({
        success: false,
        message: `Royalty shares must sum to exactly 100%. Provided total is ${totalPercentage}%. Transaction rejected.`
      });
    }

    // Generate unique song ID
    const songId = "SONG_" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Process audio file or synthesize demo buffer
    let audioBuffer;
    let fileName = "sample_audio.mp3";
    if (req.file) {
      audioBuffer = fs.readFileSync(req.file.path);
      fileName = req.file.filename;
    } else {
      // Create a deterministic placeholder buffer if no file attached
      audioBuffer = Buffer.from(`Music audio payload for ${title} (${songId}) - decentralized music copyright`);
    }

    // Pin file to IPFS
    const ipfsResult = ipfsService.pinSongFile(audioBuffer, {
      songId,
      title,
      genre,
      description
    });

    const creatorWallet = req.body.creatorWallet || rightsHolders[0].wallet;

    // Prepare arrays for smart contract
    const wallets = rightsHolders.map(h => h.wallet);
    const sharesBps = rightsHolders.map(h => Math.round(Number(h.sharePercentage) * 100)); // e.g. 50% -> 5000 bps
    const roles = rightsHolders.map(h => h.role || "Rights Holder");

    // Submit transaction to blockchain
    const onChainResult = await blockchainService.registerSong({
      songId,
      title,
      ipfsHash: ipfsResult.audioCid,
      rightsHolders: wallets,
      shares: sharesBps,
      roles,
      fromAddress: creatorWallet
    });

    // Store in off-chain database
    const newSong = db.insert("songs", {
      songId,
      title,
      genre: genre || "General",
      description: description || "",
      duration: duration || "3:30",
      audioFileName: req.file ? fileName : null,
      ipfsAudioCid: ipfsResult.audioCid,
      ipfsMetadataCid: ipfsResult.metadataCid,
      sha256Hash: ipfsResult.sha256,
      creator: creatorWallet,
      rightsHolders: rightsHolders.map((h, i) => ({
        name: h.name || `Contributor ${i + 1}`,
        wallet: h.wallet,
        sharePercentage: Number(h.sharePercentage),
        role: h.role
      })),
      status: "Registered",
      totalStreams: 0,
      totalRoyaltyPaidEth: "0.0",
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber,
      gasUsed: onChainResult.gasUsed,
      executionMode: onChainResult.mode
    });

    db.logAudit(
      "SONG_REGISTERED",
      creatorWallet,
      `Registered copyright for '${title}' (${songId}) with ${rightsHolders.length} rights holders`,
      onChainResult.txHash
    );

    res.status(201).json({
      success: true,
      message: "Song registered and recorded on blockchain successfully",
      song: newSong,
      onChainResult
    });
  } catch (error) {
    console.error("Error registering song:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to register song" });
  }
};

exports.getAllSongs = async (req, res) => {
  try {
    const songs = db.getCollection("songs");

    // Augment with live on-chain stats if available
    const augmentedSongs = await Promise.all(
      songs.map(async song => {
        const onChain = await blockchainService.getOnChainSong(song.songId);
        if (onChain) {
          return {
            ...song,
            totalStreams: Number(onChain.totalStreams),
            totalRoyaltyPaidEth: onChain.totalRoyaltyPaidEth,
            status: onChain.status === 2 ? "Verified" : onChain.status === 1 ? "Registered" : song.status
          };
        }
        return song;
      })
    );

    res.json({ success: true, songs: augmentedSongs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const { songId } = req.params;
    const song = db.findOne("songs", { songId });
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    const onChain = await blockchainService.getOnChainSong(songId);
    const licenses = db.find("licenses", { songId });
    const usageRecords = db.find("usageRecords", { songId });

    res.json({
      success: true,
      song: {
        ...song,
        ...(onChain ? {
          totalStreams: Number(onChain.totalStreams),
          totalRoyaltyPaidEth: onChain.totalRoyaltyPaidEth,
          status: onChain.status === 2 ? "Verified" : onChain.status === 1 ? "Registered" : song.status
        } : {})
      },
      licenses,
      usageRecords,
      onChain
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.streamAudio = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send("Audio file not found");
};
