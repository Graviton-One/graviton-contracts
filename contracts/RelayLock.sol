//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";

interface IRelayLock {
    function lock(string calldata destination, bytes calldata receiver) external payable;

    event Lock(string indexed destinationHash, bytes indexed receiverHash, string destination, bytes receiver, uint256 amount);
}
interface WNative {
     function deposit() external payable;

     function withdraw(uint wad) external;
     
     function approve(address spender, uint256 amount) external returns (bool);
}
interface V2Router {
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts);
}

/// @title RelayLock
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract RelayLock is IRelayLock {

    address public owner;
    WNative public wnative;
    V2Router public router;
    IERC20 public gton;

    constructor (WNative _wnative, V2Router _router, IERC20 _gton) {
        owner = msg.sender;
        wnative = _wnative;
        router = _router;
        gton = _gton;
    }

    function lock(string calldata destination, bytes calldata receiver) external payable override {
        wnative.deposit{value: msg.value}();
        wnative.approve(address(router), msg.value);
        address[] memory path = new address[](2);
        path[0] = address(wnative);
        path[1] = address(gton);
        uint[] memory amounts = router.swapExactTokensForTokens(msg.value, 0, path, address(this), block.timestamp+3600);
        emit Lock(destination, receiver, destination, receiver, amounts[0]);
    }

    function reclaimERC20(IERC20 token) public {
        require(msg.sender == owner, "");
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
    
    function reclaimNative(uint256 amount) public {
        require(msg.sender == owner, "");
        payable(msg.sender).transfer(amount);
    }
}
