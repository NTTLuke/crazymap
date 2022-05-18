const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { smodd, smock } = require("@defi-wonderland/smock");

//https://npm.io/package/ngeohash
const geohash = require('ngeohash');

describe("CrazyFuryMaps", function () {

  it("Should add new CF location because you have Crazy Fury NFT - Buy me a coffee", async function () {
    //https://github.com/ethers-io/ethers.js/issues/1362 for signers balance 

    const [owner, usr1] = await ethers.getSigners();

    let balance = await owner.getBalance();
    //console.log("initial balances of ETH: owner: %s", balance.toString());

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    let walletBalanceBefore = await owner.getBalance();
    await cfmaps.connect(usr1).setLocationWithACoffee("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("0.01") });
    let walletBalanceAfter = await owner.getBalance();

    //console.log(walletBalanceBefore);
    //console.log(walletBalanceAfter);

    expect(await cfmaps.connect(usr1).getSize()).to.equal(1);
    expect(Number(walletBalanceBefore)).to.lessThan(Number(walletBalanceAfter));

  });

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

    await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

  });

 
  it("Should NOT add new CF location because DiscordName is empty", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //revert 
    await expect(cfmaps.setLocation("", "GeoHashValue")).to.be.revertedWith("DiscordName can not be empty");

  });

  it("Should NOT get CF member location because CF member no longer owns CF NFT ", async function () {

    const [owner, usr1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.whenCalledWith(owner.address).returns(1);
    myFakeCrazyFury.balanceOf.whenCalledWith(usr1.address).returns(1);

    await cfmaps.connect(owner).setLocation("owner", "ownerlocation");
    await cfmaps.connect(usr1).setLocation("usr1", "usr1location");

    //simulate user no longer owns CF NFT
    myFakeCrazyFury.balanceOf.whenCalledWith(usr1.address).returns(0);
    
    const size = await cfmaps.connect(owner).getSize();
    expect(size).to.equal(2);

    //owner is present
    let locationOwner = await cfmaps.connect(owner).get(0);
    expect(locationOwner.crazyFuryDiscordName).to.equal("owner");
    expect(locationOwner.geohash).to.equal("ownerlocation");

    //user is not returned
    let locationUser  = await cfmaps.connect(owner).get(1);
    expect(locationUser.crazyFuryDiscordName).to.equal("");
    expect(locationUser.geohash).to.equal("");

  });

  it("Should NOT add new CF location because Location is empty", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //revert 
    await expect(cfmaps.setLocation("DiscorName", "")).to.be.revertedWith("Location can not be empty");

  });

  it("Should NOT get location when user no longer owns CF NFT", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //t0 he owns the NFT
    await cfmaps.setLocation("DiscorName", "Location");

    //mock behaviour for simulating user no longer owns NFT
    myFakeCrazyFury.balanceOf.returns(0);

    //revert 
    await expect(cfmaps.setLocation("DiscorName", "Location")).to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

  });


});
