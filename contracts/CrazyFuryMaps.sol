// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CrazyFuryMaps {

    
    //Crazy Fury NFT Limit 
    uint private CF_NFT_LIMIT  = 3561;
     
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

        console.log("loading CrazyfuryMaps smart contract with CrazyFury contract address :", _cfContractAdr);
        
        //for dependency injection testnet
        cfContractAdr = _cfContractAdr;
    }

    //for insert and edit crazyfury position
    function setLocation(
        string memory crazyFuryDiscordName,
        string memory geoHash
    ) OnlyCrazyFuryOwner external {

        //CF NFT Limit check 
        require(crazyFuryAddresses.length < CF_NFT_LIMIT, "CrazyFury members limit reached");

        //set position 
        crazyFuryPositionsMap[msg.sender] = CrazyFuryPosition(crazyFuryDiscordName, geoHash, false);

        if(!inserted[msg.sender]){
            inserted[msg.sender] = true;
            crazyFuryAddresses.push(msg.sender);
        }
    }

    function enableNinjaMode() OnlyCrazyFuryMapsMember external{

        CrazyFuryPosition memory crazyFuryPosition = crazyFuryPositionsMap[msg.sender];
        crazyFuryPosition.isNinja = true;
        crazyFuryPositionsMap[msg.sender] = crazyFuryPosition;
    }

    function disableNinjaMode() OnlyCrazyFuryMapsMember external{

        CrazyFuryPosition memory crazyFuryPosition = crazyFuryPositionsMap[msg.sender];
        crazyFuryPosition.isNinja = false;
        crazyFuryPositionsMap[msg.sender] = crazyFuryPosition;
    }

    function getSize() OnlyCrazyFuryMapsMember external view returns (uint) {
        return crazyFuryAddresses.length;
    }

    function get(uint index) OnlyCrazyFuryMapsMember    
                             OnlyCrazyFuryMapsMemberNinjaModeOff 
                             external view returns (CrazyFuryPositionResponse memory) {
        
        CrazyFuryPosition memory _crazyFuryPositionsMap = crazyFuryPositionsMap[crazyFuryAddresses[index]];
        CrazyFuryPositionResponse memory crazyFuryPositionResponse;
        if(_crazyFuryPositionsMap.isNinja){
           return crazyFuryPositionResponse;
        }
        
        crazyFuryPositionResponse = CrazyFuryPositionResponse(_crazyFuryPositionsMap.crazyFuryDiscordName, _crazyFuryPositionsMap.geohash);
        return crazyFuryPositionResponse;
    }

    function getCrazyFuryContractAddress() external view returns(address){
        return cfContractAdr;
    }

    
    modifier OnlyCrazyFuryOwner() {
        require(IERC721(cfContractAdr).balanceOf(msg.sender) > 0, "Hey Bro, You don't have a crazy fury NFT");
        _;
    }

    modifier OnlyCrazyFuryMapsMember() {
        require(inserted[msg.sender], "Only Crazy Fury Maps member can perform this action! Add your position first!");
        _;
    }

    modifier OnlyCrazyFuryMapsMemberNinjaModeOff() {
        require(!crazyFuryPositionsMap[msg.sender].isNinja, "Only Crazy Fury Maps member ninja mode off can perform this action");
        _;
    }
}
