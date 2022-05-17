const { ethers } = require("hardhat");

const main = async () => {

    //Deploy fake contract for testing
    const cfContractFactoryFake = await hre.ethers.getContractFactory('MyFakeCrazyFury');
    const cfContractFake = await cfContractFactoryFake.deploy();
    await cfContractFake.deployed();

    console.log("Contract fake deployed to:", cfContractFake.address);


    const cfContractFactory = await hre.ethers.getContractFactory('CrazyFuryMaps');
    const cfMapsContract = await cfContractFactory.deploy(cfContractFake.address);
    await cfMapsContract.deployed();

    console.log("Contract deployed to:", cfMapsContract.address);

    const [owner, addr1 ]= await ethers.getSigners();
    
    console.log("Setting fake address for testing...");
    let txn = await cfContractFake.setUserAddr(owner.address);
    await txn.wait();
    console.log("Fake address set!");

    txn = await cfMapsContract.setLocation("DiscordName", "GeoHashValue", {from: owner.address});
    await txn.wait();
    console.log("cf location set!");

    let cfLocation = await cfMapsContract.get(0, {from: owner.address});
    console.log("cfLocation:", cfLocation.crazyFuryDiscordName, cfLocation.geohash);

    
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();