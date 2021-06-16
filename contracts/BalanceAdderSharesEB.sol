//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceAdderShares.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IImpactKeeper.sol';

/// @title BalanceAdderSharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderSharesEB is IBalanceAdderShares {

    IBalanceKeeperV2 balanceKeeper;
    IImpactKeeper impactEB;

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
    }

    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
          addr := mload(add(bys,20))
        }
    }

    function getShareById(uint id) public view override returns (uint) {
        string memory chain = balanceKeeper.userChainById(id);
        if (keccak256(abi.encodePacked(chain)) == keccak256(abi.encodePacked("EVM"))) {
            return 0;
        }
        bytes memory addr = balanceKeeper.userAddressById(id);
        if (addr.length != 20) {
            return 0;
        }
        address user = bytesToAddress(addr);
        return impactEB.impact(user);
    }

    function getTotal() public view override returns (uint) {
        return impactEB.totalSupply();
    }
}
