// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyFakeCrazyFury is ERC721 {

    //true if address owns this token 
    mapping(address => bool) private owners;

    constructor() ERC721("MyFakeCrazyFury", "FKCF") {}

    function setUserAddr(address _userAddr) external {
        owners[_userAddr] = true;
    }

    function removeUserAddr(address _userAddr) external {
        require(owners[_userAddr], "No User address found");

        owners[_userAddr] = false;
    }

    function balanceOf(address _owner) public view override returns (uint256) {
        if (owners[_owner]) return 1;
        return 0;
    }
}
