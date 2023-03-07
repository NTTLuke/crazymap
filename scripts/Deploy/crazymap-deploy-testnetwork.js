const { ethers } = require("hardhat");

const main = async () => {

    //signers
    const [owner, user1] = await ethers.getSigners();

    //Deploy fake contract for testing
    const cfContractFactoryFake = await hre.ethers.getContractFactory('MyFakeCrazyFuryNFT');
    const cfContractFake = await cfContractFactoryFake.deploy();
    await cfContractFake.deployed();

    console.log("Contract fake deployed to:", cfContractFake.address);

    const CrazyMap = await ethers.getContractFactory('CrazyMap');
    const proxy = await upgrades.deployProxy(CrazyMap, [cfContractFake.address]);
    await proxy.deployed();


    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxy.address
    );

    console.log('Proxy contract address: ' + proxy.address);
    console.log('Implementation contract address: ' + implementationAddress);
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