// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrazyFuryMaps is Ownable {
    //CF Contract Address
    address private cfContractAdr;

    bool public paused;

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
        paused = false;
    }

    function _setLocation(string memory discordName, string memory geoHash)
        private
    {
        require(bytes(discordName).length != 0, "DiscordName can not be empty");
        require(bytes(geoHash).length != 0, "Location can not be empty");
        require(!paused, "Contract Paused");

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

    function _get(address cfAddress) private view returns (CFLocation memory) {
        CFLocation memory cfLocation = cfLocationsMap[cfAddress];
        return cfLocation;
    }

    function setLocation(string memory discordName, string memory geoHash)
        external
        onlyCrazyFuryOwnerCanInvoke
    {
        _setLocation(discordName, geoHash);
    }

    function _checkIfCrazyFuryRequiredMemberExists(address cfAddress)
        private
        view
    {
        require(
            IERC721(cfContractAdr).balanceOf(cfAddress) > 0,
            "The member is no longer a crazy fury owner"
        );
    }

    function _checkIfCrazyFuryMapsRequiredMemberExists(address cfAddress)
        private
        view
    {
        require(inserted[cfAddress], "Crazy Fury Maps member doesn't exist");
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function editLocation(string memory discordName, string memory geoHash)
        external
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
    {
        _setLocation(discordName, geoHash);
    }

    function removeMyLocation(uint256 index)
        external
        onlyCrazyFuryMapsMemberCanInvoke
    {
        require(!paused, "Contract Paused");
        require(index < cfAddresses.length, "Index out of bounds");

        address cfAddressOwner = cfAddresses[index];
        require(
            cfAddressOwner == msg.sender,
            "You are not the owner of this location"
        );

        delete cfLocationsMap[msg.sender];
        delete inserted[msg.sender];

        //delete and fix the gap
        delete cfAddresses[index];
        cfAddresses[index] = cfAddresses[cfAddresses.length - 1];
        cfAddresses.pop();
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

        _checkIfCrazyFuryRequiredMemberExists(cfAddress);
        _checkIfCrazyFuryMapsRequiredMemberExists(cfAddress);

        return _get(cfAddress);
    }

    function getByAddress(address cfAddress)
        external
        view
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
        returns (CFLocation memory)
    {
        _checkIfCrazyFuryRequiredMemberExists(cfAddress);
        _checkIfCrazyFuryMapsRequiredMemberExists(cfAddress);

        return _get(cfAddress);
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
}
