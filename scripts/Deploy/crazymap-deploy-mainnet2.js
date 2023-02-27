const { ethers } = require("hardhat");

const main = async () => {

    //signers
    // const [owner, user1] = await ethers.getSigners();

    const gas = await ethers.provider.getGasPrice();
    
    let CF_CONTRACT_ADDR = "0x04047358179df7FE24E578219336212346dF1C07";

    const CrazyMap = await ethers.getContractFactory('CrazyMap');
    const proxy = await upgrades.deployProxy(CrazyMap, [CF_CONTRACT_ADDR], { gasPrice: 10000000000 });
    await proxy.deployed();

    console.log('Proxy deployed at ' + proxy.address);
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