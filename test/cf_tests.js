const { expect } = require("chai");
const { ethers } = require("hardhat");
const { smodd, smock } = require("@defi-wonderland/smock");

//https://npm.io/package/ngeohash
const geohash = require('ngeohash');

describe("CrazyFuryMaps", function () {

  it("Should be the external contract set when deployed ", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();


    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    expect(await cfmaps.getCrazyFuryContractAddress()).to.equal(myFakeCrazyFury.address);

  });

  it("Should add new CF location because you have Crazy Fury NFT - GeoHash check", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    let geohashValue = geohash.encode(37.83238649368286, 112.55838632583618);
    console.log(geohashValue);

    await cfmaps.setLocation("CFDiscordName", geohashValue);

    const size = await cfmaps.getSize();
    const location = await cfmaps.get(size - 1);

    let latlon = geohash.decode(location.geohash);

    expect(latlon.latitude).to.equal(37.83238649368286);
    expect(latlon.longitude).to.equal(112.55838632583618);

  });

  it("Should add new CF location because you have Crazy Fury NFT - Array index size check", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    expect(await cfmaps.getSize()).to.equal(1);

  });

  it("Should add new CF location because you have Crazy Fury NFT - Location value check", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    const size = await cfmaps.getSize();
    const location = await cfmaps.get(size - 1);

    expect(location.crazyFuryDiscordName).to.equal("CFDiscordName");
    expect(location.geohash).to.equal("GeoHashValue");

  });

  it("Should retrieve 10 CrazyFury location - Location value check", async function () {

    const signers = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();


    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //insert 10 locations with different wallet address
    for (let index = 0; index < 10; index++) {
      let discordName = "DiscordName" + index;
      let geohashValue = "GeoHashValue" + index;

      await cfmaps.connect(signers[index]).setLocation(discordName, geohashValue);
    }

    const size = await cfmaps.getSize();
    expect(size).to.equal(10);

    for (let index = 0; index < size; index++) {

      const location = await cfmaps.get(index);
      discordName = "DiscordName" + index;
      geohashValue = "GeoHashValue" + index;

      expect(location.crazyFuryDiscordName).to.equal(discordName);
      expect(location.geohash).to.equal(geohashValue);

    }

  });

  it("Should activate ninja mode on", async function () {


    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();


    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    await cfmaps.enableNinjaMode();

    const size = await cfmaps.getSize();

    await expect(cfmaps.get(size - 1)).to.be.revertedWith("Only Crazy Fury Maps member ninja mode off can perform this action");

  });


  it("Should activate ninja mode off", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    await cfmaps.enableNinjaMode();
    await cfmaps.disableNinjaMode();

    const size = await cfmaps.getSize();
    const location = await cfmaps.get(size - 1);

    expect(location.crazyFuryDiscordName).to.equal("CFDiscordName");
    expect(location.geohash).to.equal("GeoHashValue");
  });
});


describe("CrazyFuryMaps", function () {
  it("Should NOT add new CF location because you don't have Crazy Fury NFT", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(0);

    await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Hey Bro, You don't have a crazy fury NFT");

  });

  it("Should NOT add new CF location because members limit reached", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();


    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);
    //set members limit to 1 in order to test array limit
    await cfmaps.setVariable('CF_NFT_LIMIT', 1);

    //first location is ok 
    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");

    //revert 
    await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("CrazyFury members limit reached");

  });
});
