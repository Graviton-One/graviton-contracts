//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";

interface IRelayLock {
    function lock(bytes calldata receiver) external payable;

    event Lock(uint256 amount, bytes receiver);
}
interface WNative {
     function deposit() external payable;

     function withdraw(uint wad) external;
}
interface V2Router {
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts);
}

/// @title RelayLock
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract RelayLock is IRelayLock {

    WNative wnative;
    V2Router router;
    IERC20 gton;

    constructor (WNative _wnative, V2Router _router, IERC20 _gton) {
        wnative = _wnative;
        router = _router;
        gton = _gton;
    }

    function lock(bytes calldata receiver) external payable override {
        // TODO: transfer native
        // TODO: wrap native to erc20
        wnative.deposit{value: msg.value}();
        // TODO: swap for gton on dex
        address[] memory path = new address[](2);
        path[0] = address(wnative);
        path[1] = address(gton);
        uint[] memory amounts = router.swapExactTokensForTokens(msg.value, 0, path, address(this), block.timestamp+3600);
        // TODO: throw event
        emit Lock(amounts[0], receiver);
    }
}
