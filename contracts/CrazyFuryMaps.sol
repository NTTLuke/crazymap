// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrazyFuryMaps is Ownable {

    //CF Contract Address
    address private cfContractAdr;

    struct CrazyFuryPosition {
        string crazyFuryDiscordName;
        string geohash;
        bool isNinja;
    }

    struct CrazyFuryPositionResponse {
        string crazyFuryDiscordName;
        string geohash;
    }

    //mapping address with CrazyFuryPosition
    mapping(address => CrazyFuryPosition) private crazyFuryPositionsMap;
    mapping(address => bool) private inserted;

    address[] private crazyFuryAddresses;

    constructor(address _cfContractAdr) {
        console.log(
            "loading CrazyfuryMaps smart contract with CrazyFury contract address :",
            _cfContractAdr
        );

        //for dependency injection testnet
        cfContractAdr = _cfContractAdr;
    }

    function setLocationInternal(
        string memory crazyFuryDiscordName,
        string memory geoHash
    ) private {
        
        require(
            bytes(crazyFuryDiscordName).length != 0,
            "DiscordName can not be empty"
        );
        require(bytes(geoHash).length != 0, "Location can not be empty");

        //set position
        crazyFuryPositionsMap[msg.sender] = CrazyFuryPosition(
            crazyFuryDiscordName,
            geoHash,
            false
        );

        if (!inserted[msg.sender]) {
            inserted[msg.sender] = true;
            crazyFuryAddresses.push(msg.sender);
        }
    }

    //for insert and edit crazyfury position no payable
    function setLocation(
        string memory crazyFuryDiscordName,
        string memory geoHash
    ) external OnlyCrazyFuryOwner {
        setLocationInternal(crazyFuryDiscordName, geoHash);
    }

    //for insert and edit crazyfury position payable
    function setLocationWithACoffee(
        string memory crazyFuryDiscordName,
        string memory geoHash
    ) external payable OnlyCrazyFuryOwner {
        setLocationInternal(crazyFuryDiscordName, geoHash);

        //buy me a coffee :)
        (bool sent, ) = owner().call{value: 570000000000000 wei}("");
        require(sent, "Failed to send Ether to address");
    }

    function enableNinjaMode()
        external
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
    {
        CrazyFuryPosition memory crazyFuryPosition = crazyFuryPositionsMap[
            msg.sender
        ];
        crazyFuryPosition.isNinja = true;
        crazyFuryPositionsMap[msg.sender] = crazyFuryPosition;
    }

    function disableNinjaMode()
        external
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
    {
        CrazyFuryPosition memory crazyFuryPosition = crazyFuryPositionsMap[
            msg.sender
        ];
        crazyFuryPosition.isNinja = false;
        crazyFuryPositionsMap[msg.sender] = crazyFuryPosition;
    }

    function getSize()
        external
        view
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
        returns (uint256)
    {
        return crazyFuryAddresses.length;
    }

    function get(uint256 index)
        external
        view
        OnlyCrazyFuryOwner
        OnlyCrazyFuryMapsMember
        OnlyCrazyFuryMapsMemberNinjaModeOff
        returns (CrazyFuryPositionResponse memory)
    {
        
        CrazyFuryPosition memory _crazyFuryPositionsMap = crazyFuryPositionsMap[crazyFuryAddresses[index]];
        CrazyFuryPositionResponse memory crazyFuryPositionResponse;

        if (_crazyFuryPositionsMap.isNinja || IERC721(cfContractAdr).balanceOf(crazyFuryAddresses[index]) == 0) {
            return crazyFuryPositionResponse;
        }

        crazyFuryPositionResponse = CrazyFuryPositionResponse(
            _crazyFuryPositionsMap.crazyFuryDiscordName,
            _crazyFuryPositionsMap.geohash
        );

        return crazyFuryPositionResponse;
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
            !crazyFuryPositionsMap[msg.sender].isNinja,
            "Only Crazy Fury Maps member ninja mode off can perform this action"
        );
        _;
    }
}
