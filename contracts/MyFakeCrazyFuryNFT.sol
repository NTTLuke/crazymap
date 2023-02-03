// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MyFakeCrazyFuryNFT is ERC721Enumerable {
    constructor() ERC721("MyFakeCrazyFuryNFT", "FCF") {}

    function mint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
    }

    function mySafeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        safeTransferFrom(from, to, tokenId, "");
    }
}
