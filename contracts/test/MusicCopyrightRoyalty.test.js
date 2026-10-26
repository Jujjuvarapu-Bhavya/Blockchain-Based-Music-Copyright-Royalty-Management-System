const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusicCopyrightRoyalty Smart Contract", function () {
  let contract;
  let owner, artist, composer, lyricist, licensee, oracle;

  beforeEach(async function () {
    [owner, artist, composer, lyricist, licensee, oracle] = await ethers.getSigners();

    const MusicCopyrightRoyalty = await ethers.getContractFactory("MusicCopyrightRoyalty");
    contract = await MusicCopyrightRoyalty.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the right owner and authority", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.copyrightAuthority()).to.equal(owner.address);
    });
  });

  describe("Song Registration & Rights Holders", function () {
    it("should register a song with valid 100% share breakdown (50%, 30%, 20%)", async function () {
      const songId = "SONG_DEMO_01";
      const title = "Blockchain Symphony";
      const ipfsHash = "QmTestHash123456789";
      const holders = [artist.address, composer.address, lyricist.address];
      const shares = [5000, 3000, 2000]; // 50%, 30%, 20%
      const roles = ["Artist", "Composer", "Lyricist"];

      await expect(
        contract.connect(artist).registerSong(songId, title, ipfsHash, holders, shares, roles)
      )
        .to.emit(contract, "SongRegistered")
        .withArgs(songId, title, artist.address, ipfsHash, (ts) => ts > 0);

      const song = await contract.getSongDetails(songId);
      expect(song.title).to.equal(title);
      expect(song.creator).to.equal(artist.address);
      expect(song.status).to.equal(1); // Registered

      const rights = await contract.getRightsHolders(songId);
      expect(rights.wallets.length).to.equal(3);
      expect(rights.shares[0]).to.equal(5000n);
      expect(rights.shares[1]).to.equal(3000n);
      expect(rights.shares[2]).to.equal(2000n);
    });

    it("should REJECT registration when shares do not equal 100% (e.g. 115%)", async function () {
      const songId = "SONG_INVALID";
      const title = "Invalid Share Song";
      const ipfsHash = "QmInvalidHash";
      const holders = [artist.address, composer.address, lyricist.address];
      const shares = [5000, 4500, 2000]; // 115% total (11,500 bps)
      const roles = ["Artist", "Composer", "Lyricist"];

      await expect(
        contract.connect(artist).registerSong(songId, title, ipfsHash, holders, shares, roles)
      ).to.be.revertedWith("Shares must sum to 10000 bps (100%)");
    });

    it("should REJECT duplicate song IDs", async function () {
      const songId = "SONG_DUP";
      const holders = [artist.address];
      const shares = [10000];
      const roles = ["Solo Artist"];

      await contract.connect(artist).registerSong(songId, "Track 1", "Qm1", holders, shares, roles);

      await expect(
        contract.connect(artist).registerSong(songId, "Track 2", "Qm2", holders, shares, roles)
      ).to.be.revertedWith("Song ID already registered");
    });
  });

  describe("Verification & Licensing", function () {
    beforeEach(async function () {
      await contract.connect(artist).registerSong(
        "SONG001",
        "Harmonic Wave",
        "QmHash001",
        [artist.address, composer.address],
        [7000, 3000],
        ["Artist", "Composer"]
      );
    });

    it("should allow authority to verify a song", async function () {
      await expect(contract.connect(owner).verifySong("SONG001"))
        .to.emit(contract, "SongStatusUpdated");

      const song = await contract.getSongDetails("SONG001");
      expect(song.status).to.equal(2); // Verified
    });

    it("should create a license with fee payment and distribute royalties immediately", async function () {
      const fee = ethers.parseEther("1.0");

      await expect(
        contract.connect(licensee).createLicense(
          "LIC001",
          "SONG001",
          licensee.address,
          365,
          "Commercial",
          fee,
          { value: fee }
        )
      )
        .to.emit(contract, "LicenseCreated")
        .withArgs("LIC001", "SONG001", licensee.address, "Commercial", fee, 365n)
        .and.to.emit(contract, "RoyaltyDistributed");

      // Check pending withdrawals: artist (70% = 0.7 ETH), composer (30% = 0.3 ETH)
      const artistPending = await contract.pendingWithdrawals(artist.address);
      const composerPending = await contract.pendingWithdrawals(composer.address);

      expect(artistPending).to.equal(ethers.parseEther("0.7"));
      expect(composerPending).to.equal(ethers.parseEther("0.3"));
    });
  });

  describe("Usage Tracking & Royalty Distribution / Withdrawal", function () {
    beforeEach(async function () {
      await contract.setAuthorizedOracle(oracle.address, true);

      await contract.connect(artist).registerSong(
        "SONG002",
        "Echoes of Eternity",
        "QmHash002",
        [artist.address, composer.address, lyricist.address],
        [5000, 3000, 2000], // 50%, 30%, 20%
        ["Artist", "Composer", "Lyricist"]
      );
    });

    it("should record verified streaming usage from an authorized oracle", async function () {
      await expect(
        contract.connect(oracle).recordUsage("USG001", "SONG002", 250000, "Spotify")
      )
        .to.emit(contract, "UsageRecorded")
        .withArgs("USG001", "SONG002", 250000n, "Spotify", oracle.address);

      const song = await contract.getSongDetails("SONG002");
      expect(song.totalStreams).to.equal(250000n);
    });

    it("should distribute royalties and allow rights holders to withdraw", async function () {
      const royaltyAmount = ethers.parseEther("2.0");

      // Platform deposits royalty
      await expect(
        contract.connect(licensee).distributeRoyalty("SONG002", { value: royaltyAmount })
      )
        .to.emit(contract, "RoyaltyDistributed")
        .withArgs("SONG002", royaltyAmount, (ts) => ts > 0);

      // Expected cuts: Artist 50% = 1.0 ETH, Composer 30% = 0.6 ETH, Lyricist 20% = 0.4 ETH
      expect(await contract.pendingWithdrawals(artist.address)).to.equal(ethers.parseEther("1.0"));
      expect(await contract.pendingWithdrawals(composer.address)).to.equal(ethers.parseEther("0.6"));
      expect(await contract.pendingWithdrawals(lyricist.address)).to.equal(ethers.parseEther("0.4"));

      // Artist withdraws their royalty
      const initialBalance = await ethers.provider.getBalance(artist.address);
      const tx = await contract.connect(artist).withdrawRoyalty();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(artist.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("1.0") - gasUsed);

      // Pending balance reset to 0
      expect(await contract.pendingWithdrawals(artist.address)).to.equal(0n);
    });
  });
});
