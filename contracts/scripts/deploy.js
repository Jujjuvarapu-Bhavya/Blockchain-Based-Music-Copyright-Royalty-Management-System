const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of MusicCopyrightRoyalty...");

  const [deployer, artist, composer, lyricist, platform] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const MusicCopyrightRoyalty = await hre.ethers.getContractFactory("MusicCopyrightRoyalty");
  const contract = await MusicCopyrightRoyalty.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("MusicCopyrightRoyalty deployed to:", contractAddress);

  // Authorize platform if deployer is owner
  if (platform) {
    const authTx = await contract.setAuthorizedPlatform(platform.address, true);
    await authTx.wait();
    console.log("Authorized test platform:", platform.address);
  }

  // Pre-seed a sample song to demonstrate immediate working state if desired
  if (artist && composer && lyricist) {
    console.log("Registering sample demo song: SONG001 ('Midnight Melody')...");
    const songId = "SONG001";
    const title = "Midnight Melody";
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const holders = [artist.address, composer.address, lyricist.address];
    const shares = [5000, 3000, 2000]; // 50%, 30%, 20% = 100%
    const roles = ["Artist", "Composer", "Lyricist"];

    const regTx = await contract.connect(artist).registerSong(
      songId,
      title,
      ipfsHash,
      holders,
      shares,
      roles
    );
    await regTx.wait();
    console.log("Sample song SONG001 registered successfully!");

    // Verify the song via authority (deployer)
    const verifyTx = await contract.verifySong(songId);
    await verifyTx.wait();
    console.log("Sample song SONG001 verified by authority!");
  }

  // Write deployment info for backend and frontend consumption
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    accounts: {
      deployer: deployer ? deployer.address : null,
      artist: artist ? artist.address : null,
      composer: composer ? composer.address : null,
      lyricist: lyricist ? lyricist.address : null,
      platform: platform ? platform.address : null,
    }
  };

  const sharedDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  // Save contract artifact ABI and address
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MusicCopyrightRoyalty.sol/MusicCopyrightRoyalty.json");
  let artifact = {};
  if (fs.existsSync(artifactPath)) {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  const exportData = {
    address: contractAddress,
    abi: artifact.abi || [],
    ...deploymentInfo
  };

  fs.writeFileSync(path.join(sharedDir, "contract-deployment.json"), JSON.stringify(exportData, null, 2));
  console.log("Saved deployment metadata to shared/contract-deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
