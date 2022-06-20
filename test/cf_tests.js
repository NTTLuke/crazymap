const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { smodd, smock } = require("@defi-wonderland/smock");

//https://npm.io/package/ngeohash
const geohash = require('ngeohash');


describe("CrazyFuryMaps events", function () {
  it("Should emit LocationAdded", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //the the event emitted by the contract
    await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue"))
      .to.emit(cfmaps, "LocationAdded")
      .withArgs("CFDiscordName", "GeoHashValue", owner.address)

  });
});




describe("CrazyFuryMaps Should", function () {


  it("Should be the external contract set when deployed ", async function () {

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    //

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
    //console.log(geohashValue);

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

  it("Should edit existing CF location - member exists check", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    await cfmaps.editLocation("CFDiscordNameEdited", "GeoHashValueEdited");

    let size = await cfmaps.getSize();
    cfInfo = await cfmaps.get(size - 1);

    expect(cfInfo.discordName).to.equal("CFDiscordNameEdited");
    expect(cfInfo.geohash).to.equal("GeoHashValueEdited");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });

  it("Should add new CF location because you have Crazy Fury NFT - cfInfo value check", async function () {

    const [owner] = await ethers.getSigners();
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
    const cfInfo = await cfmaps.get(size - 1);

    expect(cfInfo.discordName).to.equal("CFDiscordName");
    expect(cfInfo.geohash).to.equal("GeoHashValue");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });

  it("Should retrieve CFLocation by Address ", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    const cfInfo = await cfmaps.getByAddress(owner.address);

    expect(cfInfo.discordName).to.equal("CFDiscordName");
    expect(cfInfo.geohash).to.equal("GeoHashValue");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });

  it("Should remove my location if I'm the owner", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    await cfmaps.removeMyLocation();
  
    await expect(cfmaps.getByAddress(owner.address)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");
    await expect(cfmaps.get(0)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });

  it("Should remove a location if I'm the contract owner", async function () {

    const [owner, usr1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.connect(owner).setLocation("User1", "GeoHashValue");
    await cfmaps.connect(usr1).setLocation("Owner", "GeoHashValue");

    await cfmaps.connect(owner).removeLocationByAddress(usr1.address);
  
    await expect(cfmaps.getByAddress(usr1.address)).to.be.revertedWith("Crazy Fury Maps member doesn't exist");
    await expect(cfmaps.get(1)).to.be.revertedWith("Crazy Fury Maps member doesn't exist");

  });

  it("Should remove my location if I'm the owner and I don't own CF NFT anymore ", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    
    //no longer owner of CF NFT
    myFakeCrazyFury.balanceOf.returns(0)
    
    //I can remove my location
    await cfmaps.removeMyLocation();
  
  });


  it("Should retrieve 20 CrazyFury location - Location value check", async function () {

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
    for (let index = 0; index < 20; index++) {
      let discordName = "DiscordName" + index;
      let geohashValue = "GeoHashValue" + index;

      await cfmaps.connect(signers[index]).setLocation(discordName, geohashValue);
    }

    const size = await cfmaps.getSize();
    expect(size).to.equal(20);

    for (let index = 0; index < size; index++) {

      const location = await cfmaps.get(index);
      discordName = "DiscordName" + index;
      geohashValue = "GeoHashValue" + index;

      expect(location.discordName).to.equal(discordName);
      expect(location.geohash).to.equal(geohashValue);

    }
  });
});

describe("CrazyFuryMaps Should NOT", function () {
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

    //simulate usr1 no longer owns CF NFT
    myFakeCrazyFury.balanceOf.whenCalledWith(usr1.address).returns(0);

    const size = await cfmaps.connect(owner).getSize();
    expect(size).to.equal(2);

    //NOTE : we are using the owner address to call the function since the usr1 no longer owns the NFT
    //owner location is returned
    let locationOwner = await cfmaps.connect(owner).get(0);
    expect(locationOwner.discordName).to.equal("owner");
    expect(locationOwner.geohash).to.equal("ownerlocation");

    //user location is not returned
    //revert 
    await expect(cfmaps.connect(owner).get(1)).to.be.revertedWith("The member is no longer a crazy fury owner");
  
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

  it("Should NOT retrieve CFLocation by Address since the user doesn't exist", async function () {

    const [owner, usr1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    //insert owner
    await cfmaps.connect(owner).setLocation("owner", "ownerlocation");

    //revert when asking for usr1
    await expect(cfmaps.connect(owner).getByAddress(usr1.address)).to.be.revertedWith("Crazy Fury Maps member doesn't exist");

  });

  it("Should NOT retrieve CFLocation by Index since index is out of bound", async function () {

    const [owner, usr1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    
    //insert owner
    await cfmaps.connect(owner).setLocation("owner", "ownerlocation");
    let size = await cfmaps.connect(owner).getSize();
    
    expect(size,1);
    
    //revert when asking for not existing index
    await expect(cfmaps.connect(owner).get(2)).to.be.revertedWith("Index out of bounds");

  });

  it("Should NOT edit CF location since member doesn't exists ", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await expect(cfmaps.editLocation("CFDiscordNameEdited", "GeoHashValueEdited")).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });

  it("Should NOT remove another user's location if I'm NOT the contract owner", async function () {

    const [owner, usr1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.connect(owner).setLocation("User1", "GeoHashValue");
    await cfmaps.connect(usr1).setLocation("Owner", "GeoHashValue");

    await expect(cfmaps.connect(usr1).removeLocationByAddress(owner.address)).to.be.revertedWith("Ownable: caller is not the owner");

  });

  it("Should NOT remove my location if I have alredy removed it ", async function () {

    const [owner] = await ethers.getSigners();

    //Deploy fake contract for testing
    const myContractFactory = await smock.mock('MyFakeCrazyFury');
    const myFakeCrazyFury = await myContractFactory.deploy();

    const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
    const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
    await cfmaps.deployed();

    //mock behaviour 
    myFakeCrazyFury.balanceOf.returns(1);

    await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
    
    //no longer owner of CF NFT
    myFakeCrazyFury.balanceOf.returns(0)
    
    //I can remove my location
    await cfmaps.removeMyLocation();
  
    //Not possible remove my location twice 
    await expect(cfmaps.removeMyLocation()).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });
  
});
