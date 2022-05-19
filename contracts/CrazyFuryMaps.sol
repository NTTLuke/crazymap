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
    event LocationAdded(string discordName, string geoHash, address cfMemberAdr);
    
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

    //for insert and edit crazyfury position
    function setLocation(string memory discordName, string memory geoHash)
        external
        OnlyCrazyFuryOwner
    {
        setLocationInternal(discordName, geoHash);
    }

    //for insert and edit crazyfury position payable
    function setLocationWithACoffee(
        string memory discordName,
        string memory geoHash
    ) external payable OnlyCrazyFuryOwner {
        setLocationInternal(discordName, geoHash);

        //buy me a coffee :)
        (bool sent, ) = owner().call{value: 570000000000000 wei}("");
        require(sent, "Failed to send Ether to address");
    }

    function enableNinjaMode()
        external
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
    {
        CFLocation memory cfLocation = cfLocationsMap[msg.sender];

        cfLocation.isNinja = true;
        cfLocationsMap[msg.sender] = cfLocation;

        //emit event
        emit NinjaOnSet(cfLocation.discordName, cfLocation.geohash, msg.sender);
    }

    function disableNinjaMode()
        external
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
    {
        CFLocation memory cfLocation = cfLocationsMap[msg.sender];
        cfLocation.isNinja = false;
        cfLocationsMap[msg.sender] = cfLocation;

        //emit event
        emit NinjaOffSet(cfLocation.discordName, cfLocation.geohash, msg.sender);
    }

    function getSize()
        external
        view
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
        returns (uint256)
    {
        return cfAddresses.length;
    }

    function get(uint256 index)
        external
        view
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
        OnlyCrazyFuryMapsMemberNinjaModeOff
        returns (CFLocationResult memory)
    {
        address cfAddress = cfAddresses[index];
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

    function getByAddress(address cfAddress)
        external
        view
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
        OnlyCrazyFuryMapsMemberNinjaModeOff
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

    function getCrazyFuryContractAddress() external view returns (address) {
        return cfContractAdr;
    }

    modifier OnlyCrazyFuryOwner() {
        require(
            IERC721(cfContractAdr).balanceOf(msg.sender) > 0,
            "Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access."
        );
        _;
    }

    modifier OnlyCrazyFuryMapsMember() {
        require(
            inserted[msg.sender],
            "Only Crazy Fury Maps member can perform this action! Add your position first!"
        );
        _;
    }

    modifier OnlyCrazyFuryMapsMemberNinjaModeOff() {
        require(
            !cfLocationsMap[msg.sender].isNinja,
            "Only Crazy Fury Maps member ninja mode off can perform this action"
        );
        _;
    }
}
