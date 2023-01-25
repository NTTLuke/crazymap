// SPDX-License-Identifier: MIT


//TODO : manage pause events from PausableUpgradeable

pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


contract CrazyMap is OwnableUpgradeable, PausableUpgradeable  {
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

    function initialize(address _cfContractAdr) public initializer {
        // console.log(
        //     "loading CrazyfuryMaps smart contract with CrazyFury contract address :",
        //     _cfContractAdr
        // );

        //init owner with
        __Ownable_init();

        //pausable init to false
        __Pausable_init();

        //for dependency injection testnet
        cfContractAdr = _cfContractAdr;
        
    }

    function _setLocation(string memory discordName, string memory geoHash)
        whenNotPaused
        private
    {
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

    function _get(address cfAddress) private view returns (CFLocation memory) {
        CFLocation memory cfLocation = cfLocationsMap[cfAddress];
        return cfLocation;
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


    function setLocation(string memory discordName, string memory geoHash)
        payable
        external
        whenNotPaused
        onlyCrazyFuryOwnerCanInvoke
    {
        //at least one coffee
        require(msg.value > 0.001 ether , "Hey bro, at least one coffee please! :) ");
        
        _setLocation(discordName, geoHash);
        (bool sent, ) = payable(owner()).call{value : msg.value}("");
        require(sent);
    }

    function Pause() external onlyOwner {
        // paused = _paused;
        
        //TODO Check the emitted event
        _pause();
    }

    function UnPause() external onlyOwner {
        // paused = _paused;
        
        //TODO Check the emitted event
        _unpause();
    }

    function editLocation(string memory discordName, string memory geoHash)
        external
        whenNotPaused
        onlyCrazyFuryOwnerCanInvoke
        onlyCrazyFuryMapsMemberCanInvoke
    {
        _setLocation(discordName, geoHash);
    }

    function removeMyLocation(uint256 index)
        external
        whenNotPaused
        onlyCrazyFuryMapsMemberCanInvoke
    {
        //require(!paused, "Contract Paused");
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
        //TODO ??? NOT SURE !!!!
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

    //TODO : Implementing Set CrazyFuryContractAddress


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
