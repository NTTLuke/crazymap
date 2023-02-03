const { expect, use, assert } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { smodd, smock } = require("@defi-wonderland/smock");
const geohash = require('ngeohash');  //https://npm.io/package/ngeohash

//TODO : SET AND GET price of the service ;) in the Version2 so we can use that for testing upgrade
//REDO the crazyFuryNFT method for testing on Goerli
//TODO Separate testing files
//TODO READ STORAGE in order to introduce the topic related sensitive data

async function deployFixture() {
  const [owner, user1, usr2, usr3] = await ethers.getSigners();

  //Deploy fake contract for testing
  const myContractFactory = await smock.mock('MyFakeCrazyFuryNFT');
  const myFakeCrazyFury = await myContractFactory.deploy();

  const CrazyFuryMaps = await ethers.getContractFactory('CrazyMap');
  const proxy = await upgrades.deployProxy(CrazyFuryMaps, [myFakeCrazyFury.address]);
  await proxy.deployed();

  return { myFakeCrazyFury, proxy, owner, user1, usr2, usr3 };
}


describe("CrazyMap Upgrade", function () {

  it("Should storage is preserved when crazy map is upgraded", async function () {

    //simulate new cf release and checking storage

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    let proxyAddress = proxy.address;    

    //crazymapV1 implementation address
    let implementationAddressV1 = await upgrades.erc1967.getImplementationAddress(
      proxyAddress
    );
  
    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.connect(user1).setLocation("CFDiscordNameUs1", "GeoHashValueUs1", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(owner).setLocation("CFDiscordNameOwner", "GeoHashValueOwner", { value: ethers.utils.parseEther("1") });

    let size = await proxy.getSize();
    expect(size).to.equal(2);


    //deploy new version 
    const CrazyMapV2 = await ethers.getContractFactory('CrazyMapV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, CrazyMapV2);
  
    let implementationAddressV2 = await upgrades.erc1967.getImplementationAddress(
      proxyAddress
    );
  
    expect(implementationAddressV1).to.not.equal(implementationAddressV2);

    //check storage
    size = await proxy.getSize();
    expect(size).to.equal(2);

  });

});

describe("CrazyMap events", function () {

  it("Should emit LocationAdded", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //event emitted by the contract
    await expect(proxy.connect(user1).setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") }))
      .to.emit(proxy, "LocationAdded")
      .withArgs("CFDiscordName", "GeoHashValue", user1.address);

  });

  it("Should emit Paused", async function () {

    const { proxy, owner } = await deployFixture();

    //event emitted by the contract
    await expect(proxy.connect(owner).Pause())
      .to.emit(proxy, "Paused")
      .withArgs(owner.address);

  });

  it("Should emit UnPaused", async function () {

    const { proxy, owner } = await deployFixture();

    //pause
    await proxy.connect(owner).Pause();

    //event emitted by the contract
    await expect(proxy.connect(owner).UnPause())
      .to.emit(proxy, "Unpaused")
      .withArgs(owner.address);

  });


});

describe("CrazyMap Should", function () {

  it("Should be the external contract set when deployed ", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();
    expect(await proxy.getCrazyFuryContractAddress()).to.equal(myFakeCrazyFury.address);

  });

  it("Should owner balance be increased when setLocation", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //owner balance before setLocation
    let balance = await ethers.provider.getBalance(owner.address);

    //user1 setLocation
    await proxy.connect(user1).setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    //balance increased for owner 
    expect(await ethers.provider.getBalance(owner.address)).to.be.above(balance);

  });

  it("Should user has to pay at least 0.0011 when setLocation", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //owner balance before setLocation
    let balance = await ethers.provider.getBalance(owner.address);

    //user1 setLocation
    await proxy.connect(user1).setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("0.0011") });

    //balance increased for owner 
    expect(await ethers.provider.getBalance(owner.address)).to.be.above(balance);

  });

  it("Should add new CF location because you have Crazy Fury NFT - GeoHash check", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock NFT behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    let geohashValue = geohash.encode(37.83238649368286, 112.55838632583618);
    //console.log(geohashValue);

    await proxy.setLocation("CFDiscordName", geohashValue, { value: ethers.utils.parseEther("10.0") });

    const size = await proxy.getSize();
    const location = await proxy.get(size - 1);

    let latlon = geohash.decode(location.geohash);

    expect(latlon.latitude).to.equal(37.83238649368286);
    expect(latlon.longitude).to.equal(112.55838632583618);

  });

  it("Should add new CF location because you have Crazy Fury NFT - Array index size check", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

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

  it("Should add new CF location because you have Crazy Fury NFT - cfInfo value check", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    const size = await proxy.getSize();
    const cfInfo = await proxy.get(size - 1);

    expect(cfInfo.discordName).to.equal("CFDiscordName");
    expect(cfInfo.geohash).to.equal("GeoHashValue");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });

  it("Should retrieve CFLocation by Address ", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    const cfInfo = await proxy.getByAddress(owner.address);

    expect(cfInfo.discordName).to.equal("CFDiscordName");
    expect(cfInfo.geohash).to.equal("GeoHashValue");
    expect(cfInfo.cfMemberAdr).to.equal(owner.address);

  });

  it("Should pause contract if owner", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //pause smart contract
    await proxy.connect(owner).Pause();

    //reverted because paused
    await expect(proxy.setLocation("CFDiscordName", "GeoHashValue"), { value: ethers.utils.parseEther("10.0") }).to.be.revertedWith("Pausable: paused");

  });


  it("Should UnPause from contract if owner", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //pause smart contract
    await proxy.connect(owner).Pause();

    //remove paused smart contract
    await proxy.connect(owner).UnPause();

    //no revert
    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

  });

  it("Should change cf address if I'm the crazy map contract owner", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //Deploy another fake contract for testing
    const myContractFactory2 = await smock.mock('MyFakeCrazyFuryNFT');
    const myFakeCrazyFury2 = await myContractFactory2.deploy();

    //mock behaviour
    myFakeCrazyFury2.balanceOf.returns(100);

    //change cf address
    await proxy.connect(owner).setCrazyFuryContractAddress(myFakeCrazyFury2.address);

    //check the address
    let cf2Address = await proxy.getCrazyFuryContractAddress();
    expect(cf2Address).to.not.equal(myFakeCrazyFury.address);

    //check the balance of mock 
    let balanceOf = await myFakeCrazyFury2.balanceOf(owner.address);
    expect(balanceOf).to.equal(100);

  });

  it("Should remove my location if my location", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.removeMyLocation(0);

    await expect(proxy.getByAddress(owner.address)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");
    await expect(proxy.get(0)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });


  it("Should remove few locations and clean storage data properly", async function () {

    const { myFakeCrazyFury, proxy, owner, user1, usr2, usr3 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.connect(owner).setLocation("Owner", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(user1).setLocation("User1", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(usr2).setLocation("User2", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(usr3).setLocation("User3", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    //get the size of the array
    let size = await proxy.connect(owner).getSize();
    expect(size).to.equal(4);

    //remove location for usr2 and usr3
    await proxy.connect(usr2).removeMyLocation(2);

    //now usr3 has been placed at index 2
    await proxy.connect(usr3).removeMyLocation(2);

    size = await proxy.connect(owner).getSize();
    expect(size).to.equal(2);

    for (let index = 0; index < size; index++) {

      let cfInfo = await proxy.connect(owner).get(index);

      expect(cfInfo.cfMemberAdr).to.not.equal(usr2.address);
      expect(cfInfo.cfMemberAdr).to.not.equal(usr3.address);
    }
  });

  it("Should remove my location if I'm the owner and I don't own CF NFT anymore ", async function () {


    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    //no longer owner of CF NFT
    myFakeCrazyFury.balanceOf.returns(0)

    //I can remove my location
    await proxy.removeMyLocation(0);

  });


  it("Should retrieve 20 CrazyFury location - Location value check", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //get all signers
    const signers = await ethers.getSigners();


    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //insert locations with different wallet address
    for (let index = 0; index < 20; index++) {
      let discordName = "DiscordName" + index;
      let geohashValue = "GeoHashValue" + index;

      await proxy.connect(signers[index]).setLocation(discordName, geohashValue, { value: ethers.utils.parseEther("1.0") });
    }

    const size = await proxy.getSize();
    expect(size).to.equal(20);

    for (let index = 0; index < size; index++) {

      const location = await proxy.get(index);
      discordName = "DiscordName" + index;
      geohashValue = "GeoHashValue" + index;

      expect(location.discordName).to.equal(discordName);
      expect(location.geohash).to.equal(geohashValue);

    }
  });

});

describe("CrazyFuryMaps Should NOT", function () {
  it("Should NOT add new CF location because you don't have Crazy Fury NFT", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(0);

    await expect(proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") }))
      .to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

  });

  it("Should NOT add new CF location because DiscordName is empty", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //revert
    await expect(proxy.setLocation("", "GeoHashValue", { value: ethers.utils.parseEther("10.0") }))
      .to.be.revertedWith("DiscordName can not be empty");

  });

  it("Should NOT get CF member location because CF member no longer owns CF NFT ", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.whenCalledWith(owner.address).returns(1);
    myFakeCrazyFury.balanceOf.whenCalledWith(user1.address).returns(1);

    await proxy.connect(owner).setLocation("owner", "ownerlocation", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(user1).setLocation("user1", "usr1location", { value: ethers.utils.parseEther("10.0") });

    //simulate usr1 no longer owns CF NFT
    myFakeCrazyFury.balanceOf.whenCalledWith(user1.address).returns(0);

    const size = await proxy.connect(owner).getSize();
    expect(size).to.equal(2);

    //NOTE : we are using the owner address to call the function since the usr1 no longer owns the NFT
    //owner location is returned
    let locationOwner = await proxy.connect(owner).get(0);
    expect(locationOwner.discordName).to.equal("owner");
    expect(locationOwner.geohash).to.equal("ownerlocation");

    //user location is not returned
    //revert
    await expect(proxy.connect(owner).get(1)).to.be.revertedWith("The member is no longer a crazy fury owner");

  });

  it("Should NOT add new CF location because Location is empty", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //revert
    await expect(proxy.setLocation("DiscorName", "", { value: ethers.utils.parseEther("10.0") }))
      .to.be.revertedWith("Location can not be empty");

  });

  it("Should NOT get location when user no longer owns CF NFT", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //t0 he owns the NFT
    await proxy.setLocation("DiscorName", "Location", { value: ethers.utils.parseEther("10.0") });

    //mock behaviour for simulating user no longer owns NFT
    myFakeCrazyFury.balanceOf.returns(0);

    //revert
    await expect(proxy.setLocation("DiscorName", "Location", { value: ethers.utils.parseEther("10.0") }))
      .to.be.revertedWith("Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.");

  });

  it("Should NOT retrieve CFLocation by Address since the user doesn't exist", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //insert owner
    await proxy.connect(owner).setLocation("owner", "ownerlocation", { value: ethers.utils.parseEther("10.0") });

    //revert when asking for usr1
    await expect(proxy.connect(owner).getByAddress(user1.address))
      .to.be.revertedWith("Crazy Fury Maps member doesn't exist");

  });

  it("Should NOT retrieve CFLocation by Index since index is out of bound", async function () {

    const { myFakeCrazyFury, proxy, owner } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //insert owner
    await proxy.connect(owner).setLocation("owner", "ownerlocation", { value: ethers.utils.parseEther("10.0") });
    let size = await proxy.connect(owner).getSize();

    expect(size, 1);

    //revert when asking for not existing index
    await expect(proxy.connect(owner).get(2)).to.be.revertedWith("Index out of bounds");

  });

  it("Should NOT edit CF location since member doesn't exists ", async function () {

    const { myFakeCrazyFury, proxy } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await expect(proxy.editLocation("CFDiscordNameEdited", "GeoHashValueEdited"))
      .to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });

  it("Should NOT remove another user's location if I'm NOT the location owner", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.connect(owner).setLocation("User1", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
    await proxy.connect(user1).setLocation("Owner", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    await expect(proxy.connect(user1).removeMyLocation(0))
      .to.be.revertedWith("You are not the owner of this location");

  });

  it("Should NOT remove my location if I have alredy removed it ", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    //no longer owner of CF NFT
    myFakeCrazyFury.balanceOf.returns(0)

    //I can remove my location
    await proxy.removeMyLocation(0);

    //Not possible remove my location twice
    await expect(proxy.removeMyLocation(0)).to.be.revertedWith("Only Crazy Fury Maps member can perform this action! Add your position first!");

  });

  it("Should NOT add my location if contract is paused", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //pause smart contract
    await proxy.connect(owner).Pause();

    //Not possible remove my location twice
    await expect(proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") }))
      .to.be.revertedWith("Pausable: paused");

  });

  it("Should NOT edit my location if contract is paused", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //add my location
    await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });

    //pause smart contract
    await proxy.connect(owner).Pause();

    //Not possible remove my location twice
    await expect(proxy.editLocation("CFDiscordName", "GeoHashValue")).to.be.revertedWith("Pausable: paused");

  });

  it("Should NOT set location if msg.value is lte 0.001", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    await expect(proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("0.001") }))
      .to.be.revertedWith("Hey bro, at least one coffee is appreciated! :) ");

  });

  it("Should NOT pause contract if not owner", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //Not possible set pause since usr1 is not the owner
    await expect(proxy.connect(user1).Pause()).to.be.revertedWith("Ownable: caller is not the owner");

  });

  it("Should NOT unpause from contract if not owner", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //mock behaviour
    myFakeCrazyFury.balanceOf.returns(1);

    //owner paused contract
    await proxy.connect(owner).Pause();

    //Not possible unpause since usr1 is not the owner
    await expect(proxy.connect(user1).UnPause())
      .to.be.revertedWith("Ownable: caller is not the owner");

  });

  it("Should NOT change cf address if I'm NOT the crazy map contract owner", async function () {

    const { myFakeCrazyFury, proxy, owner, user1 } = await deployFixture();

    //Deploy another fake contract for testing
    const myContractFactory2 = await smock.mock('MyFakeCrazyFuryNFT');
    const myFakeCrazyFury2 = await myContractFactory2.deploy();

    //mock behaviour
    myFakeCrazyFury2.balanceOf.returns(100);

    //Not possible unpause since usr1 is not the owner
    await expect(proxy.connect(user1).setCrazyFuryContractAddress(myFakeCrazyFury2.address))
      .to.be.revertedWith("Ownable: caller is not the owner");

  });

});
