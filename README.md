
![alt text](./app/DRAFT/Logo.jpg)
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
npm restore
npm start
```

### **First Use**

On first use, UI will show you this message 

> Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.

The reason is that Goerli doesn't have a  **REAL Crazy Fury Smart Contract** deployed, so we have to simulate the NFT ownership.

For doing that : 
- Open the script 

    ``` scripts/demo/mint-fake-crazyfury-nft.js ```

- Set your wallet address 

    ``` const myAddress = "SET YOUR ADDRESS BEFORE RUN"; ```

- Run the script :  

    ```npx hardhat run .\scripts\Demo\mint-fake-crazyfury-nft.js  --network goerli ```

### **Add your home base**
A **Crazy Map member** is someone who have added his location and only **Crazy Map members** can see others members' locations on the map.

Let's add your location to see others members:

- double click on map where you are located now :)
- set your discord name.
- click Save.

### **Update your home base**
Let's say you are a digital nomad and you change frequently your home base.

- double click on map where you are located now :)
- click Update.


## Caveats

Crazy Map smart contract has a dependency with Crazy Fury ERC721 smart contract, to check if the user ows the NFT (balanceOf).

For testing purpose a fake ERC721 called [MyFakeCrazyFuryNFT.sol](/contracts/MyFakeCrazyFuryNFT.sol) has been created in order to simulate the mainnet behaviour.

## Goerli smart contract references

```
Crazy Fury fake contract: 
0xC2Dddd7241a7C258c25a594007B6BB0F03207DF4

Crazy Map proxy contract:
0x9DdA4Fff341778C5E063Bed36FE15fBA28ada758
```

