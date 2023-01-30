const hre = require("hardhat");

async function main() {

  const CF_FAKE_ADDR= "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
  const PROXY_ADDR = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
  const [owner, user1] = await ethers.getSigners();
  
  const crazyFury = await ethers.getContractAt("MyFakeCrazyFuryNFT", CF_FAKE_ADDR);
  
  //just for info
  let tokenId = 1;
  console.log("TokenId" , 1);
  
  //NOTE : comment this line to generates revert when setLocation
  //simulate ownership using ERC721 implementation
  await crazyFury.mint(owner.address, tokenId);
    
  const proxy = await ethers.getContractAt("CrazyMap", PROXY_ADDR);
  await proxy.setLocation("CFDiscordName", "GeoHashValue", { value: ethers.utils.parseEther("10.0") });
  console.log("set location by owner");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
