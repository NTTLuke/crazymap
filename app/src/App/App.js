import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.scss";
import abi from "../utils/CrazyMap.json";
import abiFake from "../utils/MyFakeCrazyFuryNFT.json";
import Geohash from "latlon-geohash";
import MapView from "../Map/Map";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import LogoTitle from "../assets/Logo.jpg";
import MadeFooter from "../assets/made footer.jpg";

export default function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */

  const [currentAccount, setCurrentAccount] = useState("");
  const [isCheckingAccount, setCheckingAccount] = useState(true);
  const [checkingAddress, setCheckingAddress] = useState(true);
  const [markerLocations, setMarkerLocations] = useState({});
  const [noNFTError, setNoNFTError] = useState("");
  const [noLocationError, setNoLocationError] = useState("");
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const contractAddress = "0x6ADa73e6192a40922E926595539D768C983B836A";
  const contractABI = abi.abi;

  const crazyFuryAddress = "0x04047358179df7FE24E578219336212346dF1C07";
  const cfFakeABI = abiFake.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts && accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);

        setCurrentAccount(account);
        setTestCurrentAccount();
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crazyFuryMaps = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
      } else {
        setCheckingAccount(false);
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setLocation = async (discordName, marker) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crazyFuryMaps = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waveTxn = await crazyFuryMaps.setLocation(
          discordName,
          Geohash.encode(marker.lat, marker.lng),
          { value: ethers.utils.parseEther("0.0012") }
        );
        setUpdatingLocation(true);
        await waveTxn.wait();

        if (noLocationError) {
          setNoLocationError(false);
          getLocations();
        } else {
          setUpdatingLocation(false);
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLocations = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crazyFuryMaps = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const locationSize = await crazyFuryMaps.getSize();
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        let markerProps = {};
        for (let index = 0; index < locationSize; index++) {
          const location = await crazyFuryMaps.get(index);

          if (location.crazyFuryDiscordName !== "") {
            markerProps[location.cfMemberAdr] = {
              discordName: location.discordName,
              location: Geohash.decode(location.geohash),
              isMainAccount:
                parseInt(account, 16) === parseInt(location.cfMemberAdr, 16),
            };
          }
        }
        setUpdatingLocation(false);
        setMarkerLocations(markerProps);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLocationByAddress = async () => {
    try {
      const { ethereum } = window;
      
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        const account = accounts[0];

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crazyFuryMaps = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log(account);

        const location = await crazyFuryMaps.getByAddress(account);
        setCheckingAddress(false);
        getLocations();
        console.log("Location", location);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setCheckingAddress(false);

      //https://opensea.io/collection/montylab
      const error1 =
        "Hey Bro, only CrazyFury members can use this service. Buy CrazyFury NFT to get access.";
      const error2 =
        "Only Crazy Fury Maps member can perform this action! Add your position first!";
      if (error1 === error.reason) {
        setNoNFTError(error.reason);
      }
      if (error2 === error.reason) {
        var errorMessage = "Only Crazy Maps member can see others on the map. Add your position first!"
        setNoLocationError(errorMessage);
      }
    }
  };

  const setTestCurrentAccount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        const account = accounts[0];
        console.log("set this account for fakeContract:", account);

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const crazyFuryContractFake = new ethers.Contract(
          crazyFuryAddress,
          cfFakeABI,
          signer
        );
        console.log("account", account);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCheckingAccount(true);
      setCurrentAccount(accounts[0]);

      //setTestCurrentAccount();
    } catch (error) {
      console.log(error);
    }
  };
  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    getLocationByAddress();
  }, [currentAccount]);

  return (
    <div>
      <div className="navbar">
        {/* <img src={LogoMap} alt="logoMap" className="logoMap" /> */}
        <img src={LogoTitle} alt="logoTitle" className="logoTitle" />
        <span
          className="questionMark"
          title="Double Click on map to set or update your position"
        >
          &#63;
        </span>
      </div>
      {!currentAccount && !isCheckingAccount && (
        <div className="connectButton">
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      )}
      {noNFTError && (
        <div className="error1">
          <FontAwesomeIcon icon={faWarning} />
          &nbsp;{noNFTError} 
          <br/>

          {/* for goerli */}
          {/* <div className="plainText">
            ** CALL TO ACTION FOR GOERLI NETWORK ** 
            <br/>
            <br/>
            For Goerli you have to "simulate" the ownership of CrazyFury NFT for using CrazyMap 
            <ul>
              <li>open "Demo/mint-fake-crazyfury-nft.js" and follow the instructions</li>
            </ul>
          </div> */}
          {/* for mainnet */}
          <a target="_blank" href="https://opensea.io/collection/montylab">Here</a>
        </div>
      )}

      {currentAccount && !noNFTError && !checkingAddress && (
        <div>
          {noLocationError && (
            <div className="error2">
              {" "}
              <FontAwesomeIcon icon={faWarning} />
              &nbsp;{noLocationError}
            </div>
          )}
          <MapView
            setLocation={setLocation}
            updatingLocation={updatingLocation}
            markerLocations={markerLocations}
            setMarkerLocations={setMarkerLocations}
            account={currentAccount}
          ></MapView>
        </div>
      )}
      
      <div className="footer">
      <img src={MadeFooter} alt="footer"  style={{width:282}} />
       <div className="footerNames"> <a href="https://github.com/domenico88" target="_blank">Dome</a> and{" "}
        <a href="https://github.com/NTTLuke" target="_blank">NTTLuke</a>
        </div>
        <a href="https://etherscan.io/address/0x6ada73e6192a40922e926595539d768c983b836a#code" className="transactionfee" target="_blank">cm fee: 0.0012 eth</a>
      </div>
    </div>
  );
}
