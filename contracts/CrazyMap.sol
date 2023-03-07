// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract CrazyMap is OwnableUpgradeable, PausableUpgradeable {
    //CF Contract Address
    address private cfContractAdr;
    //at least one coffee :)
    uint256 constant public minCrazyMapFee = 0.0012 ether;

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

    //crazy map members addresses
    address[] private cfAddresses;

    function initialize(address _cfContractAdr) public initializer {
        //init owner for OwnableUpgradeable
        __Ownable_init();
        //pausable init to false for PausableUpgradeable
        __Pausable_init();
        //crazy fury contract address
        cfContractAdr = _cfContractAdr;
    }

    function _setLocation(string calldata discordName, string calldata geoHash)
        private
        whenNotPaused
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

    function setLocation(string calldata discordName, string calldata geoHash)
        external
        payable
        whenNotPaused
        onlyCrazyFuryOwnerCanInvoke
    {
        //at least one coffee
        require(
            msg.value >= minCrazyMapFee,
            "Hey bro, at least one coffee is appreciated! :) "
        );

        _setLocation(discordName, geoHash);
        (bool sent, ) = payable(owner()).call{value: msg.value}("");
        require(sent);
    }

    function editLocation(string calldata discordName, string calldata geoHash)
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
        require(
            index < cfAddresses.length && index >= 0,
            "Index out of bounds"
        );
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

    function setCrazyFuryContractAddress(address _cfAddress)
        external
        onlyOwner
    {
        require(_cfAddress != address(0), "Address cannot be empty");
        cfContractAdr = _cfAddress;
    }

    function Pause() external onlyOwner {
        _pause();
    }

    function UnPause() external onlyOwner {
        _unpause();
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
