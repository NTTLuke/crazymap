# CrazyFuryMaps Smart Contract

CF Maps is a smart contract for storing geolocation data of CrazyFury NFT community members into the ethereum blockchain.

It can be adapted for other NFT smart contract with few changes.

## User Stories 
Every user story managed by the smart contract is covered by related tests. 

See [cf_tests.js](/test/cf_tests.js)

 
## Dependency libraries

- defi-wonderland/smock for mocking and faking 
- ngeohash for encode/decode lat and lon 
- hardhat-gas-reporter to get gas metrics when running tests : 
    - Under [hardhat.config.js](hardhat.config.js) remove the comment `//require("hardhat-gas-reporter"):`

## Scripts

[cf-deploy-localhost](cf-deploy-localhost.js) to deploy smart contract on localhost network using hardhat.
The script also runs smart contract commands for saving location for testing purpose

```
npx hardhat run .\scripts\cf-deploy-localhost.js --network localhost
```

[cf-deploy-testnet](cf-deploy-testnet.js) to deploy smart contract on Goerli testnet using hardhat

```
npx hardhat run .\scripts\cf-deploy-testnet.js --network goerli
```

[cf-deploy-mainnet](cf-deploy-mainnet.js) to deploy smart contract on ethereum mainnet with Alchemy

```
npx hardhat run .\scripts\cf-deploy-mainnet.js --network mainnet
```

## Caveats

CrazyFuryMaps smart contract has a dependency with CrazyFury ERC721 smart contract to check if the user ows the NFT (balanceOf).

For testing purpose a fake ERC721 called [MyFakeCrazyFury.sol](/contracts/MyFakeCrazyFury.sol) has been created in order to simulate the mainnet behaviour.


## Goerli smart contract references
```
Contract fake deployed to: 0x37839dE6489B979fBC80A97f4AC81e24c5606ce6

Contract deployed to: 0x053596dF559ffA57747F1B4229F7EF0a6AFF2b6F
```
