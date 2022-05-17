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