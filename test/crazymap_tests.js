const { expect, use } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { smodd, smock } = require("@defi-wonderland/smock");
//https://npm.io/package/ngeohash
const geohash = require('ngeohash');

async function deployFixture() {
  const [owner, user1] = await ethers.getSigners();

  //Deploy fake contract for testing
  const myContractFactory = await smock.mock('MyFakeCrazyFury');
  const myFakeCrazyFury = await myContractFactory.deploy();

  const CrazyFuryMaps = await ethers.getContractFactory('CrazyMap');
  const proxy = await upgrades.deployProxy(CrazyFuryMaps, [myFakeCrazyFury.address]);
  await proxy.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxy.address
  );

  // console.log('Proxy contract address: ' + proxy.address);
  // console.log('Implementation contract address: ' + implementationAddress);

  return { myFakeCrazyFury, proxy, owner, user1};
}

describe("CrazyMap events", function () {

  it("Should emit LocationAdded", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    let balance = await ethers.provider.getBalance(owner.address);

    //event emitted by the contract
    await expect(proxy.connect(user1).setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") }))
      .to.emit(proxy, "LocationAdded")
      .withArgs("CFDiscordName", "GeoHashValue", user1.address);

    expect(await ethers.provider.getBalance(owner.address)).to.be.above(balance);

  });
});

describe("CrazyMap Should", function () {

  it("Should be the external contract set when deployed ", async function () {

    const { myFakeCrazyFury, proxy} = await deployFixture();
    expect(await proxy.getCrazyFuryContractAddress()).to.equal(myFakeCrazyFury.address);

  });

  it("Should add new CF location because you have Crazy Fury NFT - GeoHash check", async function () {

    const { myFakeCrazyFury, proxy} = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    let geohashValue = geohash.encode(37.83238649368286, 112.55838632583618);
    //console.log(geohashValue);

    await proxy.setLocation("CFDiscordName", geohashValue,  { value: ethers.utils.parseEther("10.0") });

    const size = await proxy.getSize();
    const location = await proxy.get(size - 1);

    let latlon = geohash.decode(location.geohash);

    expect(latlon.latitude).to.equal(37.83238649368286);
    expect(latlon.longitude).to.equal(112.55838632583618);

  });

  it("Should add new CF location because you have Crazy Fury NFT - Array index size check", async function () {

    const { myFakeCrazyFury, proxy} = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    expect(await proxy.getSize()).to.equal(1);

  });

  it("Should edit existing CF location - member exists check", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.editLocation("CFDiscordNameEdited", "GeoHashValueEdited");

    let size = await proxy.getSize();
    cfInfo = await proxy.get(size - 1);

    expect(cfInfo.discordName).to.equal("CFDiscordNameEdited");
    expect(cfInfo.geohash).to.equal("GeoHashValueEdited");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });
});

//   it("Should add new CF location because you have Crazy Fury NFT - cfInfo value check", async function () {

//     const [owner] = await ethers.getSigners();
//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
//     const size = await cfmaps.getSize();
//     const cfInfo = await cfmaps.get(size - 1);

//     expect(cfInfo.discordName).to.equal("CFDiscordName");
//     expect(cfInfo.geohash).to.equal("GeoHashValue");
//     expect(cfInfo.cfMemberAdr).to.equal(owner.address);

//   });

//   it("Should retrieve CFLocation by Address ", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
//     const cfInfo = await cfmaps.getByAddress(owner.address);

//     expect(cfInfo.discordName).to.equal("CFDiscordName");
//     expect(cfInfo.geohash).to.equal("GeoHashValue");
//     expect(cfInfo.cfMemberAdr).to.equal(owner.address);

//   });

//   it("Should pause contract if owner", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //pause smart contract
//     await cfmaps.connect(owner).setPaused(true);

//     //Not possible remove my location twice
//     await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Contract Paused");

//   });

//   it("Should remove pause from contract if owner", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //pause smart contract
//     await cfmaps.connect(owner).setPaused(true);

//     //remove paused smart contract
//     await cfmaps.connect(owner).setPaused(false);

//     //set done w/o revert
//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");

//   });

//   it("Should remove my location if I'm the owner", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");
//     await cfmaps.removeMyLocation(0);

//     await expect(cfmaps.getByAddress(owner.address)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");
//     await expect(cfmaps.get(0)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

//   });

//   it("Should remove few locations and clean storage data properly", async function () {

//     const [owner, usr1, usr2, usr3] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.connect(owner).setLocation("Owner", "GeoHashValue");
//     await cfmaps.connect(usr1).setLocation("User1", "GeoHashValue");
//     await cfmaps.connect(usr2).setLocation("User2", "GeoHashValue");
//     await cfmaps.connect(usr3).setLocation("User3", "GeoHashValue");

//     //get the size of the array
//     let size = await cfmaps.connect(owner).getSize();
//     expect(size).to.equal(4);

//     //remove location for usr2 and usr3
//     await cfmaps.connect(usr2).removeMyLocation(2);

//     //now usr3 has been placed at index 2
//     await cfmaps.connect(usr3).removeMyLocation(2);

//     size = await cfmaps.connect(owner).getSize();
//     expect(size).to.equal(2);

//     for (let index = 0; index < size; index++) {

//       let cfInfo = await cfmaps.connect(owner).get(index);

//       expect(cfInfo.cfMemberAdr).to.not.equal(usr2.address);
//       expect(cfInfo.cfMemberAdr).to.not.equal(usr3.address);

//     }
//   });

//   it("Should remove my location if I'm the owner and I don't own CF NFT anymore ", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");

//     //no longer owner of CF NFT
//     myFakeCrazyFury.balanceOf.returns(0)

//     //I can remove my location
//     await cfmaps.removeMyLocation(0);

//   });


//   it("Should retrieve 20 CrazyFury location - Location value check", async function () {

//     const signers = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();


//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //insert 10 locations with different wallet address
//     for (let index = 0; index < 20; index++) {
//       let discordName = "DiscordName" + index;
//       let geohashValue = "GeoHashValue" + index;

//       await cfmaps.connect(signers[index]).setLocation(discordName, geohashValue);
//     }

//     const size = await cfmaps.getSize();
//     expect(size).to.equal(20);

//     for (let index = 0; index < size; index++) {

//       const location = await cfmaps.get(index);
//       discordName = "DiscordName" + index;
//       geohashValue = "GeoHashValue" + index;

//       expect(location.discordName).to.equal(discordName);
//       expect(location.geohash).to.equal(geohashValue);

//     }
//   });
// });

// describe("CrazyFuryMaps Should NOT", function () {
//   it("Should NOT add new CF location because you don't have Crazy Fury NFT", async function () {

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(0);

//     await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

//   });


//   it("Should NOT add new CF location because DiscordName is empty", async function () {

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //revert
//     await expect(cfmaps.setLocation("", "GeoHashValue")).to.be.revertedWith("DiscordName can not be empty");

//   });

//   it("Should NOT get CF member location because CF member no longer owns CF NFT ", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.whenCalledWith(owner.address).returns(1);
//     myFakeCrazyFury.balanceOf.whenCalledWith(usr1.address).returns(1);

//     await cfmaps.connect(owner).setLocation("owner", "ownerlocation");
//     await cfmaps.connect(usr1).setLocation("usr1", "usr1location");

//     //simulate usr1 no longer owns CF NFT
//     myFakeCrazyFury.balanceOf.whenCalledWith(usr1.address).returns(0);

//     const size = await cfmaps.connect(owner).getSize();
//     expect(size).to.equal(2);

//     //NOTE : we are using the owner address to call the function since the usr1 no longer owns the NFT
//     //owner location is returned
//     let locationOwner = await cfmaps.connect(owner).get(0);
//     expect(locationOwner.discordName).to.equal("owner");
//     expect(locationOwner.geohash).to.equal("ownerlocation");

//     //user location is not returned
//     //revert
//     await expect(cfmaps.connect(owner).get(1)).to.be.revertedWith("The member is no longer a crazy fury owner");

//   });

//   it("Should NOT add new CF location because Location is empty", async function () {

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //revert
//     await expect(cfmaps.setLocation("DiscorName", "")).to.be.revertedWith("Location can not be empty");

//   });

//   it("Should NOT get location when user no longer owns CF NFT", async function () {

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //t0 he owns the NFT
//     await cfmaps.setLocation("DiscorName", "Location");

//     //mock behaviour for simulating user no longer owns NFT
//     myFakeCrazyFury.balanceOf.returns(0);

//     //revert
//     await expect(cfmaps.setLocation("DiscorName", "Location")).to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

//   });

//   it("Should NOT retrieve CFLocation by Address since the user doesn't exist", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //insert owner
//     await cfmaps.connect(owner).setLocation("owner", "ownerlocation");

//     //revert when asking for usr1
//     await expect(cfmaps.connect(owner).getByAddress(usr1.address)).to.be.revertedWith("Crazy Fury Maps member doesn't exist");

//   });

//   it("Should NOT retrieve CFLocation by Index since index is out of bound", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);


//     //insert owner
//     await cfmaps.connect(owner).setLocation("owner", "ownerlocation");
//     let size = await cfmaps.connect(owner).getSize();

//     expect(size, 1);

//     //revert when asking for not existing index
//     await expect(cfmaps.connect(owner).get(2)).to.be.revertedWith("Index out of bounds");

//   });

//   it("Should NOT edit CF location since member doesn't exists ", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await expect(cfmaps.editLocation("CFDiscordNameEdited", "GeoHashValueEdited")).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

//   });

//   it("Should NOT remove another user's location if I'm NOT the location owner", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.connect(owner).setLocation("User1", "GeoHashValue");
//     await cfmaps.connect(usr1).setLocation("Owner", "GeoHashValue");

//     await expect(cfmaps.connect(usr1).removeMyLocation(0)).to.be.revertedWith("You are not the owner of this location");

//   });

//   it("Should NOT remove my location if I have alredy removed it ", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");

//     //no longer owner of CF NFT
//     myFakeCrazyFury.balanceOf.returns(0)

//     //I can remove my location
//     await cfmaps.removeMyLocation(0);

//     //Not possible remove my location twice
//     await expect(cfmaps.removeMyLocation(0)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

//   });


//   it("Should NOT add my location if contract is paused", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //pause smart contract
//     await cfmaps.connect(owner).setPaused(true);

//     //Not possible remove my location twice
//     await expect(cfmaps.setLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Contract Paused");

//   });

//   it("Should NOT edit my location if contract is paused", async function () {

//     const [owner] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //add my location
//     await cfmaps.setLocation("CFDiscordName", "GeoHashValue");

//     //pause smart contract
//     await cfmaps.connect(owner).setPaused(true);

//     //Not possible remove my location twice
//     await expect(cfmaps.editLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Contract Paused");

//   });

//   it("Should NOT pause contract if not owner", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //Not possible set pause since usr1 is not the owner
//     await expect(cfmaps.connect(usr1).setPaused(true)).to.be.revertedWith("Ownable: caller is not the owner");

//   });

//   it("Should NOT remove pause from contract if not owner", async function () {

//     const [owner, usr1] = await ethers.getSigners();

//     //Deploy fake contract for testing
//     const myContractFactory = await smock.mock('MyFakeCrazyFury');
//     const myFakeCrazyFury = await myContractFactory.deploy();

//     const CrazyFuryMaps = await smock.mock("CrazyFuryMaps");
//     const cfmaps = await CrazyFuryMaps.deploy(myFakeCrazyFury.address);
//     await cfmaps.deployed();

//     //mock behaviour
//     myFakeCrazyFury.balanceOf.returns(1);

//     //owner paused contract
//     await cfmaps.connect(owner).setPaused(true);

//     //Not possible remove pause since usr1 is not the owner
//     await expect(cfmaps.connect(usr1).setPaused(false)).to.be.revertedWith("Ownable: caller is not the owner");

//   });

// });
