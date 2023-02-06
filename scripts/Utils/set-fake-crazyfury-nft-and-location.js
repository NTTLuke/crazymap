const hre = require("hardhat");
const geohash = require('ngeohash');  //https://npm.io/package/ngeohash


//Mint FAKE Crazy Fury NFT on Goerli for one of your accounts 
//in order to start playing with CRAZY MAP :)
async function main() {

  const [user1] = await ethers.getSigners();

  //--------------------
  let geohashValue = geohash.encode(37.83238649368286, 112.55838632583618);
  console.log("GeoHash: ",geohashValue);

  let discordUserName = "NTTLuke";
  //--------------------

  const CF_FAKE_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PROXY_ADDR = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const crazyFury = await ethers.getContractAt("MyFakeCrazyFuryNFT", CF_FAKE_ADDR);
  let totalSupply = await crazyFury.totalSupply();
  console.log("TotalSupply: ", totalSupply);

  //mint 
  let tokenId = parseInt(totalSupply) + 1;
  await crazyFury.mint(user1.address, tokenId);
  console.log("Address: ", user1.address);
  console.log("FAKE Crazy Fury NFT minted with tokenId:", tokenId);

  const proxy = await ethers.getContractAt("CrazyMap", PROXY_ADDR);
  await proxy.connect(user1).setLocation(discordUserName, geohashValue, { value: ethers.utils.parseEther("10.0") });
  
  console.log("------------------------------")
  console.log("CRAZY MAP! Location Set DONE! ");
  console.log("------------------------------")
  console.log("Address: ", user1.address);
  console.log("DiscordUserName: ", discordUserName);
  console.log("GeoHash: ",geohashValue);
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
