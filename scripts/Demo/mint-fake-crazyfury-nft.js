const hre = require("hardhat");
const geohash = require('ngeohash');  //https://npm.io/package/ngeohash


//Mint FAKE Crazy Fury NFT on Goerli for your account in order to start playing with CRAZY MAP :)

//INSTRUCTIONS
//--------------------------------------
//1.Set your wallet address 
//2.Run the command below:
//"npx hardhat run .\scripts\Demo\mint-fake-crazyfury-nft.js --network goerli"
//--------------------------------------

async function main() {
  
  //GOERLI ADDRESSES
  const CF_FAKE_ADDR = "0xC2Dddd7241a7C258c25a594007B6BB0F03207DF4";
  
  //----------------------------------
  //REPLACE THIS BEFORE RUN
  //----------------------------------
  const myAddress = "SET YOUR ADDRESS BEFORE RUN";


  //----------------------------------
  const crazyFury = await ethers.getContractAt("MyFakeCrazyFuryNFT", CF_FAKE_ADDR);
  let totalSupply = await crazyFury.totalSupply();
  console.log("TotalSupply: ", totalSupply);

  //mint 
  let tokenId = parseInt(totalSupply) + 1;
  await crazyFury.mint(myAddress , tokenId);
  console.log("Address: ", myAddress);
  console.log("FAKE Crazy Fury NFT minted with tokenId:", tokenId);

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


//npx hardhat verify --network goerli  0x3382FB362c00743D616e5D9D1D04DAdE5953BCa3
