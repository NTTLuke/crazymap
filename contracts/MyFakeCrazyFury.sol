// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyFakeCrazyFury is ERC721 {

    address private userAddr;

    constructor() ERC721("MyFakeCrazyFury", "FKCF") {}

    function setUserAddr (address _userAddr) external {
        userAddr = _userAddr;
    }

    function balanceOf(address _owner) public override view returns (uint256) 
    {
        if(_owner == userAddr)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }
}