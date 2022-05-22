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
        bool isNinja;
    }

    struct CFLocationResult {
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

    //ninja mode on activated
    event NinjaOnSet(string discordName, string geoHash, address cfMemberAdr);

    //ninja mode off activated
    event NinjaOffSet(string discordName, string geoHash, address cfMemberAdr);

    //mapping address with CrazyFuryPosition
    mapping(address => CFLocation) private cfLocationsMap;
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

    function setLocationInternal(
        string memory discordName,
        string memory geoHash
    ) private {
        require(bytes(discordName).length != 0, "DiscordName can not be empty");
        require(bytes(geoHash).length != 0, "Location can not be empty");

        //set position
        cfLocationsMap[msg.sender] = CFLocation(discordName, geoHash, false);

        if (!inserted[msg.sender]) {
            inserted[msg.sender] = true;
            cfAddresses.push(msg.sender);
        }

        //emit event
        emit LocationAdded(discordName, geoHash, msg.sender);
    }

    function getInternal(address cfAddress)
        private
        view
        returns (CFLocationResult memory)
    {
        CFLocation memory cfLocation = cfLocationsMap[cfAddress];
        CFLocationResult memory cfLocationResult;

        if (
            cfLocation.isNinja ||
            IERC721(cfContractAdr).balanceOf(cfAddress) == 0
        ) {
            return cfLocationResult;
        }

        cfLocationResult = CFLocationResult(
            cfLocation.discordName,
            cfLocation.geohash,
            cfAddress
        );

        return cfLocationResult;
    }

    function setLocation(string memory discordName, string memory geoHash)
        external
        OnlyCrazyFuryOwnerCanInvoke
    {
        setLocationInternal(discordName, geoHash);
    }

    function editLocation(string memory discordName, string memory geoHash)
        external
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
    {
        setLocationInternal(discordName, geoHash);
    }

    function enableNinjaMode()
        external
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
    {
        CFLocation memory cfLocation = cfLocationsMap[msg.sender];

        cfLocation.isNinja = true;
        cfLocationsMap[msg.sender] = cfLocation;

        //emit event
        emit NinjaOnSet(cfLocation.discordName, cfLocation.geohash, msg.sender);
    }

    function disableNinjaMode()
        external
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
    {
        CFLocation memory cfLocation = cfLocationsMap[msg.sender];
        cfLocation.isNinja = false;
        cfLocationsMap[msg.sender] = cfLocation;

        //emit event
        emit NinjaOffSet(
            cfLocation.discordName,
            cfLocation.geohash,
            msg.sender
        );
    }

    function getSize()
        external
        view
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
        OnlyCrazyFuryMapsMemberNinjaModeOffCanInvoke
        returns (uint256)
    {
        return cfAddresses.length;
    }

    function get(uint256 index)
        external
        view
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
        OnlyCrazyFuryMapsMemberNinjaModeOffCanInvoke
        returns (CFLocationResult memory)
    {
        require(index < cfAddresses.length, "Index out of bounds");

        address cfAddress = cfAddresses[index];

        return getInternal(cfAddress);
    }

    function getByAddress(address cfAddress)
        external
        view
        OnlyCrazyFuryOwnerCanInvoke
        OnlyCrazyFuryMapsMemberCanInvoke
        OnlyCrazyFuryMapsMemberNinjaModeOffCanInvoke
        OnlyCrazyFuryMapsMemberExists(cfAddress)
        returns (CFLocationResult memory)
    {
        return getInternal(cfAddress);
    }

    function getCrazyFuryContractAddress() external view returns (address) {
        return cfContractAdr;
    }

    modifier OnlyCrazyFuryOwnerCanInvoke() {
        require(
            IERC721(cfContractAdr).balanceOf(msg.sender) > 0,
            "Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access."
        );
        _;
    }

    modifier OnlyCrazyFuryMapsMemberCanInvoke() {
        require(
            inserted[msg.sender],
            "Only Crazy Fury Maps member can perform this action! Add your position first!"
        );
        _;
    }

    modifier OnlyCrazyFuryMapsMemberNinjaModeOffCanInvoke() {
        require(
            !cfLocationsMap[msg.sender].isNinja,
            "Only Crazy Fury Maps member ninja mode off can perform this action"
        );
        _;
    }

    modifier OnlyCrazyFuryMapsMemberExists(address cfAddress) {
        require(inserted[cfAddress], "Crazy Fury Maps member doesn't exist");
        _;
    }
}
