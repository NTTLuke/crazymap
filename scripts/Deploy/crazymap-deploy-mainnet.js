const { ethers } = require("hardhat");
require("dotenv").config();

// etherscan api key
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;
//max price in USD for deployment
const MAX_PRICE = 61;
//crazy fury contract address on mainnet
const CF_CONTRACT_ADDR = "0x04047358179df7FE24E578219336212346dF1C07";

const main = async () => {

    if (await DeploymentPriceIsCompliant()) {
        console.log("Deployment price is OK, starting deployment...");
        await DeployOnNetwork();
        console.log("Deployment completed!");
    }
};

const DeploymentPriceIsCompliant = async () => {
    //check if deployment price is too high
    const CrazyMap = await ethers.getContractFactory('CrazyMap');

    const ethPrice = await GetEthPrice();
    //console.log(ethPrice);

    const gasPrice = await CrazyMap.signer.getGasPrice();
    //console.log(`Current gas price: ${gasPrice}`);

    const estimatedGas = await CrazyMap.signer.estimateGas(
        CrazyMap.getDeployTransaction(),
    );

    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalanceETH = await CrazyMap.signer.getBalance();
    const deployerBalanceUSD = ethers.utils.formatEther(deployerBalanceETH) * ethPrice;
    const priceUsd = ethers.utils.formatEther(deploymentPrice) * ethPrice;
    console.log("##################");
    console.log(`Deployer balance ETH:  ${ethers.utils.formatEther(deployerBalanceETH)}`);
    console.log(`Deployer balance USD:  ${deployerBalanceUSD.toFixed(2)}`);
    console.log("-----------------------------");
    console.log(`Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")}`);
    console.log(`Estimated gas: ${estimatedGas}`);
    console.log("-----------------------------");
    console.log(`Deployment price ETH:  ${ethers.utils.formatEther(deploymentPrice)}`);
    console.log(`Deployment price USD:  ${priceUsd}`);
    console.log("##################");

    if (parseFloat(priceUsd) > MAX_PRICE) {
        console.warn("WARNING: Deployment price is high!");
        return false;
    }

    return true;

    // if (deployerBalance.lt(deploymentPrice)) {
    //     throw new Error(
    //         `Insufficient funds. Top up your account balance by ${ethers.utils.formatEther(
    //             deploymentPrice.sub(deployerBalance),
    //         )}`,
    //     );
    // }
}

const DeployOnNetwork = async () => {


    const CrazyMap = await ethers.getContractFactory('CrazyMap');
    const proxy = await upgrades.deployProxy(CrazyMap, [CF_CONTRACT_ADDR]);
    await proxy.deployed();

    console.log('Proxy deployed at ' + proxy.address);
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxy.address
    );

    console.log('Proxy contract address: ' + proxy.address);
    console.log('Implementation contract address: ' + implementationAddress);

};
const GetEthPrice = async () => {

    try {
        var api = require('etherscan-api').init(ETHERSCAN_KEY);
        var price = await api.stats.ethprice();
        return price.result.ethusd;

    } catch (error) {
        console.error(error);
    }

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