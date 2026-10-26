// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MusicCopyrightRoyalty
 * @dev Smart contract for decentralized music copyright registration,
 * licensing, usage tracking via oracles, and automated royalty calculation/distribution.
 */
contract MusicCopyrightRoyalty {
    // Basis points constant: 10,000 = 100.00%
    uint256 public constant TOTAL_BASIS_POINTS = 10000;

    address public owner;
    address public copyrightAuthority;

    // Roles and authorization
    mapping(address => bool) public authorizedOracles;
    mapping(address => bool) public authorizedPlatforms;

    struct RightsHolder {
        address wallet;
        uint256 shareBasisPoints; // e.g., 5000 = 50%
        string role;              // "Artist", "Composer", "Lyricist", etc.
    }

    enum SongStatus { Unregistered, Registered, Verified, Suspended }

    struct Song {
        string songId;
        string title;
        string ipfsHash;
        address creator;
        uint256 registrationTimestamp;
        SongStatus status;
        uint256 totalStreams;
        uint256 totalRoyaltyPaid;
        bool exists;
    }

    struct License {
        string licenseId;
        string songId;
        address licensee;
        uint256 startTime;
        uint256 durationDays;
        string licenseType; // "Streaming", "Commercial", "Sync", "Broadcast"
        uint256 fee;
        bool isActive;
    }

    struct UsageRecord {
        string usageId;
        string songId;
        uint256 streamCount;
        string platformName;
        uint256 timestamp;
        address reportedBy;
    }

    // Storage mappings
    string[] private allSongIds;
    mapping(string => Song) public songs;
    mapping(string => RightsHolder[]) private songRightsHolders;
    mapping(string => License[]) private songLicenses;
    mapping(string => UsageRecord[]) private songUsageRecords;

    // Accumulated claimable royalty balance for each rights holder
    mapping(address => uint256) public pendingWithdrawals;
    mapping(address => uint256) public totalWithdrawn;

    // Events
    event SongRegistered(string indexed songId, string title, address indexed creator, string ipfsHash, uint256 timestamp);
    event SongStatusUpdated(string indexed songId, SongStatus status, address updatedBy);
    event RightsHoldersUpdated(string indexed songId, uint256 totalHolders);
    event LicenseCreated(string indexed licenseId, string indexed songId, address indexed licensee, string licenseType, uint256 fee, uint256 durationDays);
    event UsageRecorded(string indexed usageId, string indexed songId, uint256 streamCount, string platformName, address indexed reportedBy);
    event RoyaltyDistributed(string indexed songId, uint256 totalAmount, uint256 timestamp);
    event RoyaltyWithdrawn(address indexed recipient, uint256 amount, uint256 timestamp);
    event OracleAuthorizationChanged(address indexed oracle, bool authorized);
    event PlatformAuthorizationChanged(address indexed platform, bool authorized);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call");
        _;
    }

    modifier onlyAuthorityOrOwner() {
        require(msg.sender == owner || msg.sender == copyrightAuthority, "Only owner or authority can call");
        _;
    }

    modifier onlyAuthorizedUsageReporter() {
        require(
            msg.sender == owner ||
            authorizedOracles[msg.sender] ||
            authorizedPlatforms[msg.sender] ||
            songs[msg.sender != address(0) ? "" : ""].creator == msg.sender, // or checked inside
            "Unauthorized usage reporter"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        copyrightAuthority = msg.sender;
        authorizedOracles[msg.sender] = true;
        authorizedPlatforms[msg.sender] = true;
    }

    // Configuration
    function setCopyrightAuthority(address _authority) external onlyOwner {
        require(_authority != address(0), "Invalid authority address");
        copyrightAuthority = _authority;
    }

    function setAuthorizedOracle(address _oracle, bool _authorized) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        authorizedOracles[_oracle] = _authorized;
        emit OracleAuthorizationChanged(_oracle, _authorized);
    }

    function setAuthorizedPlatform(address _platform, bool _authorized) external onlyOwner {
        require(_platform != address(0), "Invalid platform address");
        authorizedPlatforms[_platform] = _authorized;
        emit PlatformAuthorizationChanged(_platform, _authorized);
    }

    /**
     * @notice Register a new song with initial rights holders and shares
     * @param _songId Unique alphanumeric identifier for the song
     * @param _title Song title
     * @param _ipfsHash Cryptographic hash / CID of the audio and metadata file
     * @param _holders List of rights holder addresses
     * @param _shares List of shares in basis points (e.g. 5000 = 50%, must sum to 10000)
     * @param _roles List of role descriptions (e.g. "Artist", "Composer")
     */
    function registerSong(
        string memory _songId,
        string memory _title,
        string memory _ipfsHash,
        address[] memory _holders,
        uint256[] memory _shares,
        string[] memory _roles
    ) external {
        require(bytes(_songId).length > 0, "Song ID required");
        require(bytes(_title).length > 0, "Title required");
        require(!songs[_songId].exists, "Song ID already registered");
        require(_holders.length > 0, "At least one rights holder required");
        require(
            _holders.length == _shares.length && _shares.length == _roles.length,
            "Mismatched rights holders array lengths"
        );

        // Validate shares sum to exactly 10,000 basis points (100.00%)
        uint256 totalShare = 0;
        for (uint256 i = 0; i < _holders.length; i++) {
            require(_holders[i] != address(0), "Invalid rights holder address");
            require(_shares[i] > 0, "Share must be greater than zero");
            totalShare += _shares[i];
        }
        require(totalShare == TOTAL_BASIS_POINTS, "Shares must sum to 10000 bps (100%)");

        // Record song
        songs[_songId] = Song({
            songId: _songId,
            title: _title,
            ipfsHash: _ipfsHash,
            creator: msg.sender,
            registrationTimestamp: block.timestamp,
            status: SongStatus.Registered,
            totalStreams: 0,
            totalRoyaltyPaid: 0,
            exists: true
        });

        allSongIds.push(_songId);

        // Store rights holders
        delete songRightsHolders[_songId];
        for (uint256 i = 0; i < _holders.length; i++) {
            songRightsHolders[_songId].push(RightsHolder({
                wallet: _holders[i],
                shareBasisPoints: _shares[i],
                role: _roles[i]
            }));
        }

        emit SongRegistered(_songId, _title, msg.sender, _ipfsHash, block.timestamp);
        emit RightsHoldersUpdated(_songId, _holders.length);
    }

    /**
     * @notice Verify a song's copyright status (Authority or Admin)
     */
    function verifySong(string memory _songId) external onlyAuthorityOrOwner {
        require(songs[_songId].exists, "Song does not exist");
        songs[_songId].status = SongStatus.Verified;
        emit SongStatusUpdated(_songId, SongStatus.Verified, msg.sender);
    }

    /**
     * @notice Update rights holders and agreed royalty shares for a song
     */
    function setRoyaltyShare(
        string memory _songId,
        address[] memory _holders,
        uint256[] memory _shares,
        string[] memory _roles
    ) external {
        require(songs[_songId].exists, "Song does not exist");
        require(
            msg.sender == songs[_songId].creator || msg.sender == owner || msg.sender == copyrightAuthority,
            "Only song creator or authority can update shares"
        );
        require(
            _holders.length == _shares.length && _shares.length == _roles.length,
            "Mismatched array lengths"
        );

        uint256 totalShare = 0;
        for (uint256 i = 0; i < _holders.length; i++) {
            require(_holders[i] != address(0), "Invalid rights holder address");
            require(_shares[i] > 0, "Share must be greater than 0");
            totalShare += _shares[i];
        }
        require(totalShare == TOTAL_BASIS_POINTS, "Shares must sum to 10000 bps (100%)");

        delete songRightsHolders[_songId];
        for (uint256 i = 0; i < _holders.length; i++) {
            songRightsHolders[_songId].push(RightsHolder({
                wallet: _holders[i],
                shareBasisPoints: _shares[i],
                role: _roles[i]
            }));
        }

        emit RightsHoldersUpdated(_songId, _holders.length);
    }

    /**
     * @notice Create a new license for song usage
     */
    function createLicense(
        string memory _licenseId,
        string memory _songId,
        address _licensee,
        uint256 _durationDays,
        string memory _licenseType,
        uint256 _fee
    ) external payable {
        require(songs[_songId].exists, "Song does not exist");
        require(bytes(_licenseId).length > 0, "License ID required");
        require(_licensee != address(0), "Invalid licensee");
        require(_durationDays > 0, "Duration must be greater than 0");

        if (_fee > 0) {
            require(msg.value >= _fee, "Insufficient payment for license fee");
            // Distribute license fee as royalty immediately
            _executeRoyaltyDistribution(_songId, msg.value);
        }

        License memory newLicense = License({
            licenseId: _licenseId,
            songId: _songId,
            licensee: _licensee,
            startTime: block.timestamp,
            durationDays: _durationDays,
            licenseType: _licenseType,
            fee: _fee,
            isActive: true
        });

        songLicenses[_songId].push(newLicense);

        emit LicenseCreated(_licenseId, _songId, _licensee, _licenseType, _fee, _durationDays);
    }

    /**
     * @notice Record verified song stream usage (Platform, Oracle, Creator, or Admin)
     */
    function recordUsage(
        string memory _usageId,
        string memory _songId,
        uint256 _streamCount,
        string memory _platformName
    ) external {
        require(songs[_songId].exists, "Song does not exist");
        require(
            msg.sender == owner ||
            authorizedOracles[msg.sender] ||
            authorizedPlatforms[msg.sender] ||
            msg.sender == songs[_songId].creator,
            "Caller not authorized to report usage"
        );
        require(_streamCount > 0, "Stream count must be > 0");

        songs[_songId].totalStreams += _streamCount;

        songUsageRecords[_songId].push(UsageRecord({
            usageId: _usageId,
            songId: _songId,
            streamCount: _streamCount,
            platformName: _platformName,
            timestamp: block.timestamp,
            reportedBy: msg.sender
        }));

        emit UsageRecorded(_usageId, _songId, _streamCount, _platformName, msg.sender);
    }

    /**
     * @notice Calculate royalty share breakdown for an arbitrary total amount
     */
    function calculateRoyalty(
        string memory _songId,
        uint256 _totalAmount
    ) external view returns (address[] memory recipients, uint256[] memory amounts) {
        require(songs[_songId].exists, "Song does not exist");
        RightsHolder[] memory holders = songRightsHolders[_songId];
        recipients = new address[](holders.length);
        amounts = new uint256[](holders.length);

        for (uint256 i = 0; i < holders.length; i++) {
            recipients[i] = holders[i].wallet;
            amounts[i] = (_totalAmount * holders[i].shareBasisPoints) / TOTAL_BASIS_POINTS;
        }
    }

    /**
     * @notice Distribute royalties to rights holders by depositing ETH
     */
    function distributeRoyalty(string memory _songId) external payable {
        require(songs[_songId].exists, "Song does not exist");
        require(msg.value > 0, "Must send ETH to distribute");

        _executeRoyaltyDistribution(_songId, msg.value);
    }

    /**
     * @dev Internal royalty allocation using Pull Payment pattern for EVM security
     */
    function _executeRoyaltyDistribution(string memory _songId, uint256 _amount) internal {
        RightsHolder[] memory holders = songRightsHolders[_songId];
        require(holders.length > 0, "No rights holders defined");

        uint256 distributedSoFar = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            uint256 shareAmount = (_amount * holders[i].shareBasisPoints) / TOTAL_BASIS_POINTS;
            // Last holder gets any remaining dust from integer division rounding
            if (i == holders.length - 1) {
                shareAmount = _amount - distributedSoFar;
            }
            distributedSoFar += shareAmount;

            pendingWithdrawals[holders[i].wallet] += shareAmount;
        }

        songs[_songId].totalRoyaltyPaid += _amount;

        emit RoyaltyDistributed(_songId, _amount, block.timestamp);
    }

    /**
     * @notice Withdraw accumulated royalties
     */
    function withdrawRoyalty() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No royalties available for withdrawal");

        // Follow Checks-Effects-Interactions pattern
        pendingWithdrawals[msg.sender] = 0;
        totalWithdrawn[msg.sender] += amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit RoyaltyWithdrawn(msg.sender, amount, block.timestamp);
    }

    // View Functions
    function getAllSongIds() external view returns (string[] memory) {
        return allSongIds;
    }

    function getSongCount() external view returns (uint256) {
        return allSongIds.length;
    }

    function getSongDetails(string memory _songId)
        external
        view
        returns (
            string memory songId,
            string memory title,
            string memory ipfsHash,
            address creator,
            uint256 registrationTimestamp,
            SongStatus status,
            uint256 totalStreams,
            uint256 totalRoyaltyPaid
        )
    {
        require(songs[_songId].exists, "Song does not exist");
        Song memory s = songs[_songId];
        return (
            s.songId,
            s.title,
            s.ipfsHash,
            s.creator,
            s.registrationTimestamp,
            s.status,
            s.totalStreams,
            s.totalRoyaltyPaid
        );
    }

    function getRightsHolders(string memory _songId)
        external
        view
        returns (
            address[] memory wallets,
            uint256[] memory shares,
            string[] memory roles
        )
    {
        require(songs[_songId].exists, "Song does not exist");
        RightsHolder[] memory holders = songRightsHolders[_songId];
        wallets = new address[](holders.length);
        shares = new uint256[](holders.length);
        roles = new string[](holders.length);

        for (uint256 i = 0; i < holders.length; i++) {
            wallets[i] = holders[i].wallet;
            shares[i] = holders[i].shareBasisPoints;
            roles[i] = holders[i].role;
        }
    }

    function getLicenses(string memory _songId) external view returns (License[] memory) {
        require(songs[_songId].exists, "Song does not exist");
        return songLicenses[_songId];
    }

    function getUsageRecords(string memory _songId) external view returns (UsageRecord[] memory) {
        require(songs[_songId].exists, "Song does not exist");
        return songUsageRecords[_songId];
    }

    function getRoyaltyDetails(string memory _songId, address _wallet)
        external
        view
        returns (
            uint256 songTotalRoyalty,
            uint256 walletPendingWithdrawal,
            uint256 walletTotalWithdrawn
        )
    {
        require(songs[_songId].exists, "Song does not exist");
        return (
            songs[_songId].totalRoyaltyPaid,
            pendingWithdrawals[_wallet],
            totalWithdrawn[_wallet]
        );
    }

    receive() external payable {}
}
