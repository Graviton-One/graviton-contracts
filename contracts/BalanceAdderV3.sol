//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceAdderV3.sol";

/// @title BalanceAdderV3
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderV3 is IBalanceAdderV3 {
    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    mapping (IFarm => mapping(IShares => uint256)) public campaignIds;
    mapping (IFarm => mapping(IShares => bool)) public isKnownCampaign;
    mapping (uint256 => IFarm) public farms;
    mapping (uint256 => IShares) public shares;
    mapping (uint256 => uint256) public lastPortions;
    uint256 public totalCampaigns;

    uint256[] public activeCampaigns;

    uint256 public currentUser;
    uint256 public currentCampaign;
    uint256 public currentPortion;
    uint256 public totalUnlocked;
    uint256 public farmAllocation;
    uint256 public totalShares;
    uint256 public totalUsers;
    uint256 public lastPulse;

    // campaignId => modificator
    mapping (uint256 => uint256) public modificator;
    // pulse => campaignId => reserve
    mapping (uint256 => mapping(uint256 => uint256)) public reserve;
    // pulse => campaignId => weight
    mapping (uint256 => mapping(uint256 => uint256)) public weight;
    // pulse => totalWeight
    mapping (uint256 => uint256) totalWeight;

    IBalanceKeeperV2 public balanceKeeper;

    mapping(uint256 => bool) public isProcessing;

    constructor(IBalanceKeeperV2 _balanceKeeper) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
    }

    function totalActiveCampaigns() public view returns (uint256) {
        return activeCampaigns.length;
    }

    function setOwner(address _owner) external isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function addCampaign(IShares _shares, IFarm _farm, uint256 _lastPortions) external isOwner {
        // TODO: handle a case where farm with the same shares and farms is added
        require(!isKnownCampaign[_farm][_shares],"BA5");
        uint256 campaignId = totalCampaigns;
        isKnownCampaign[_farm][_shares] = true;
        campaignIds[_farm][_shares] = campaignId;
        shares[campaignId] = _shares;
        farms[campaignId] = _farm;
        lastPortions[campaignId] = _lastPortions;
        modificator[campaignId] = 1;
        activeCampaigns.push(totalCampaigns);
        totalCampaigns++;
        emit AddCampaign(campaignId, _shares, _farm, _lastPortions);
    }

    /// @dev remove index from arrays
    function removeCampaign(uint256 campaignId) external isOwner {
        require(!isProcessing[currentCampaign], "BA1");

        uint256[] memory newActiveCampaigns = new uint256[](
            activeCampaigns.length - 1
        );
        uint256 j = 0;
        for (uint256 i = 0; i < activeCampaigns.length; i++) {
            if (activeCampaigns[i] == campaignId) {
                continue;
            }
            newActiveCampaigns[j] = activeCampaigns[i];
            j++;
        }
        activeCampaigns = newActiveCampaigns;

        emit RemoveCampaign(campaignId, shares[campaignId], farms[campaignId], lastPortions[campaignId]);
    }

    // TODO: replace with router
    function setReserve(uint256 campaignId, uint256 _reserve) external {
        reserve[lastPulse+1][campaignId] = _reserve;
    }

    // TODO: update weights for each set of farms separately
    function updateWeights() external {
        for (uint256 i = 0; i < activeCampaigns.length; i++) {
            if (reserve[lastPulse+1][activeCampaigns[i]] == 0) { return; }
        }
        for (uint256 i = 0; i < activeCampaigns.length; i++) {
            weight[lastPulse+1][activeCampaigns[i]] = reserve[lastPulse+1][activeCampaigns[i]] * modificator[activeCampaigns[i]];
            totalWeight[lastPulse+1] += weight[lastPulse+1][activeCampaigns[i]];
        }
        lastPulse++;
    }

    function processBalances(uint256 step) external {
        /// @dev Return if there are no farming campaigns
        if (activeCampaigns.length == 0) {
            return;
        }

        uint256 fromUser = currentUser;
        uint256 toUser = currentUser + step;

        if (!isProcessing[currentCampaign] && toUser > 0) {
            isProcessing[currentCampaign] = true;
            totalUsers = shares[activeCampaigns[currentCampaign]].totalUsers();
            totalShares = shares[activeCampaigns[currentCampaign]].totalShares();
            totalUnlocked = farms[activeCampaigns[currentCampaign]].totalUnlocked();
            // TODO: handle number truncation
            farmAllocation = (totalUnlocked * weight[lastPulse][activeCampaigns[currentCampaign]]) / totalWeight[lastPulse];
            currentPortion = farmAllocation - lastPortions[activeCampaigns[currentCampaign]];
        }

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        emit ProcessBalances(
            currentCampaign,
            shares[activeCampaigns[currentCampaign]],
            farms[activeCampaigns[currentCampaign]],
            step
        );

        if (totalShares > 0) {
            for (uint256 i = fromUser; i < toUser; i++) {
                uint256 userId = shares[activeCampaigns[currentCampaign]].userIdByIndex(i);
                uint256 add = (shares[activeCampaigns[currentCampaign]].shareById(userId) *
                    currentPortion) / totalShares;
                balanceKeeper.add(userId, add);
                emit ProcessBalance(
                    currentCampaign,
                    shares[activeCampaigns[currentCampaign]],
                    farms[activeCampaigns[currentCampaign]],
                    userId,
                    add
                );
            }
        }

        if (toUser == totalUsers) {
            lastPortions[activeCampaigns[currentCampaign]] = farmAllocation;
            isProcessing[currentCampaign] = false;
            if (currentCampaign == (activeCampaigns.length - 1)) {
                currentCampaign = 0;
            } else {
                currentCampaign++;
            }
            currentUser = 0;
        } else {
            currentUser = toUser;
        }
    }
}
