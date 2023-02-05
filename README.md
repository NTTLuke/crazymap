# Crazy Map Smart Contract

Crazy Map is a smart contract for storing geolocation data of CrazyFury NFT community members into the ethereum blockchain.

## Dependency libraries

- defi-wonderland/smock for mocking and faking 
- ngeohash for encode/decode lat and lon 
- hardhat-gas-reporter to get gas metrics when running tests : 
    - Under [hardhat.config.js](hardhat.config.js) remove the comment `//require("hardhat-gas-reporter"):`


## User Stories 
Every user story managed by the smart contract is covered by related tests. See [crazymap.js](/test/crazymap.js)

For running tests, use this command:
```
npx hardhat test .\test\crazymap.js
```

> **Caveat** : Mock/Fake library used works on hardhat network only.


## Run the webapp locally 

```
cd app 
node start
```

In order to simulate, under Goerli, the behaviour of **REAL Crazy Fury NFT**, you have to "simulate" its ownership.

For doing that : 
- Open the script 

    ``` scripts/demo/mint-fake-crazyfury-nft.js ```

- Set your wallet address 

    ``` const myAddress = "SET YOUR ADDRESS BEFORE RUN"; ```

- Run the script :  

    ```npx hardhat run .\scripts\Demo\mint-fake-crazyfury-nft.js  --network goerli ```

## Caveats

Crazy Map smart contract has a dependency with CrazyFury ERC721 smart contract to check if the user ows the NFT (balanceOf).

For testing purpose a fake ERC721 called [MyFakeCrazyFuryNFT.sol](/contracts/MyFakeCrazyFuryNFT.sol) has been created in order to simulate the mainnet behaviour.

## Goerli smart contract references

```
Crazy Fury fake contract: 
0xC2Dddd7241a7C258c25a594007B6BB0F03207DF4

Crazy Map proxy contract:
0x9DdA4Fff341778C5E063Bed36FE15fBA28ada758
```

