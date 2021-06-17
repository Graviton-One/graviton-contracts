//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IShares.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IImpactKeeper.sol';

/// @title SharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesEB is IShares {

    IBalanceKeeperV2 public balanceKeeper;
    IImpactKeeper public impactEB;

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
    }

    function bytesToAddress(bytes memory bys) internal pure returns (address addr) {
        assembly {
          addr := mload(add(bys,20))
        }
    }

    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function shareById(uint userId) public view override returns (uint) {
        if (!balanceKeeper.isKnownUser(userId)) {
            return 0;
        }
        string memory chain = balanceKeeper.userChainById(userId);
        if (!equal(chain, "EVM")) {
            return 0;
        }
        bytes memory userAddress = balanceKeeper.userAddressById(userId);
        if (userAddress.length != 20) {
            return 0;
        }
        address user = bytesToAddress(userAddress);
        return impactEB.impact(user);
    }

    function totalShares() public view override returns (uint) {
        return impactEB.totalSupply();
    }
}
