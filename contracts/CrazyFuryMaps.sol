// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrazyFuryMaps is Ownable {
    //CF Contract Address
    address private cfContractAdr;

    struct CFLocation {
        string discordName;
        string geohash;
        address cfMemberAdr;
    }

    //when location is added
    event LocationAdded(
        string discordName,
        string geoHash,
        address cfMemberAdr
    );

    //mapping address with CrazyFuryPosition
    mapping(address => CFLocation) private cfLocationsMap;
    
    //indicates if address has added a location
    mapping(address => bool) private inserted;

    address[] private cfAddresses;

    constructor(address _cfContractAdr) {
        console.log(
            "loading CrazyfuryMaps smart contract with CrazyFury contract address :",
            _cfContractAdr
        );

        //for dependency injection testnet
        cfContractAdr = _cfContractAdr;
    }

    function _setLocation(
        string memory discordName,
        string memory geoHash
    ) private {
        require(bytes(discordName).length != 0, "DiscordName can not be empty");
        require(bytes(geoHash).length != 0, "Location can not be empty");

        //set position
        cfLocationsMap[msg.sender] = CFLocation(
            discordName,
            geoHash,
            msg.sender
        );

        if (!inserted[msg.sender]) {
            inserted[msg.sender] = true;
            cfAddresses.push(msg.sender);
        }

        //emit event
        emit LocationAdded(discordName, geoHash, msg.sender);
    }

    function _get(address cfAddress)
        private
        view
        onlyCrazyFuryMapsMemberExists(cfAddress)
        returns (CFLocation memory)
    {
        CFLocation memory cfLocation = cfLocationsMap[cfAddress];
        if (IERC721(cfContractAdr).balanceOf(cfAddress) == 0) 
        {
            cfLocation = CFLocation("", "", address(0));
        }

        return cfLocation;
    }

    function setLocation(string memory discordName, string memory geoHash)
        external
        onlyCrazyFuryOwnerCanInvoke
    {
        _setLocation(discordName, geoHash);
    }

    function editLocation(string memory discordName, string memory geoHash)
        external
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
    {
        _setLocation(discordName, geoHash);
    }

    function getSize()
        external
        view
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
        returns (uint256)
    {
        return cfAddresses.length;
    }

    function get(uint256 index)
        external
        view
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
        returns (CFLocation memory)
    {
        require(index < cfAddresses.length, "Index out of bounds");

        address cfAddress = cfAddresses[index];
        return _get(cfAddress);
    }

    function getByAddress(address cfAddress)
        external
        view
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
        returns (CFLocation memory)
    {
        return _get(cfAddress);
    }

    function removeMyLocation()
        external
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
    {
        inserted[msg.sender] = false;
    }

    function removeLocationByAddress(address cfAddress)
        external
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
        onlyOwner 
    {
        require(cfAddress != address(0), "CrazyFury address can not be empty");
        inserted[cfAddress] = false;
    }

    function getCrazyFuryContractAddress() external view returns (address) {
        return cfContractAdr;
    }

    modifier onlyCrazyFuryOwnerCanInvoke() {
        require(
            IERC721(cfContractAdr).balanceOf(msg.sender) > 0,
            "Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access."
        );
        _;
    }

    modifier onlyCrazyFuryMapsMemberCanInvoke() {
        require(
            inserted[msg.sender],
            "Only Crazy Fury Maps member can perform this action! Add your position first!"
        );
        _;
    }

    modifier onlyCrazyFuryMapsMemberExists(address cfAddress) {
        require(inserted[cfAddress], "Crazy Fury Maps member doesn't exist");
        _;
    }
}
