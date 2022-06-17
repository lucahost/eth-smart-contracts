import { useState, useEffect } from "react";
import { OnboardingButton } from "./OnboardingButton";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import "./App.css";
import contractAbi from "./abi/randomNumberContract.json";

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [metaMaskNotInstalled, setMetaMaskNotInstalled] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [randomNumberIndex, setRandomNumberIndex] = useState(0);
  const [randomNumberTransactions, setRandomNumberTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);

  // useEffect check if window.ethereum is available, if not, show error page
  useEffect(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    } else {
      setMetaMaskNotInstalled(true);
    }
  }, []);

  useEffect(() => {
    if (!web3) return;
    setIsLoading(true);
    setIsError(false);

    const getAccountsAndBalance = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        console.log("Got Account and Balance", accounts, balance);
        setAccounts(
          accounts.map((account) => {
            const balanceFromWei = web3.utils.fromWei(balance, "ether");
            return { id: account, balance: balanceFromWei };
          })
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsError(true);
        setIsLoading(false);
      }
    };
    getAccountsAndBalance();
  }, [web3]);

  const calculateNewRandomNumber = async () => {
    if (!web3) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const weiAmount = web3.utils.toWei("0", "ether");
      const weiAmountGasPrice = web3.utils.toWei("0.25", "gwei");

      console.log("weiAmount", weiAmount);
      console.log("weiAmountGasPrice", weiAmountGasPrice);
      const transactionParameters = {
        nonce: "0x00", // ignored by MetaMask
        gasPrice: weiAmountGasPrice, // customizable by user during MetaMask confirmation.
        gas: web3.utils.toHex(76248), // customizable by user during MetaMask confirmation.
        to: "0x4760D1e8798c35AEFD80BE42Bd3C4B94E30E6EE8", // Required except during contract publications.
        from: accounts[0].id, // must match user's active address.
        value: weiAmount, // Only required to send ether to the recipient from the initiating external account.
        data: "0xe0c86289", // Optional, but used for defining smart contract creation and interaction.
        chainId: "0x4", // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };

      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setRandomNumberTransactions([...randomNumberTransactions, txHash]);

      console.log(txHash);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const getRandomNumber = async () => {
    setIsLoading(true);
    try {
      const randomNumberContract = new web3.eth.Contract(
        contractAbi as unknown as AbiItem,
        "0x4760D1e8798c35AEFD80BE42Bd3C4B94E30E6EE8"
      );
      const result = await randomNumberContract.methods.s_randomWords(0).call();
      setRandomNumber(result);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div style={{ alignContent: "center" }}>
        <OnboardingButton />
        <button
          className="btn-grad"
          type="button"
          onClick={() => calculateNewRandomNumber()}
        >
          Generate new Random Number
        </button>
        <button
          className="btn-grad"
          type="button"
          onClick={() => getRandomNumber()}
        >
          Get Random Number from Oracle
        </button>
      </div>
      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : isError ? (
          <div>Error</div>
        ) : (
          metaMaskNotInstalled && <div>MetaMask not installed</div>
        )}
      </div>

      <div style={{ marginTop: "10px" }}>
        <h1>Random Number:</h1>
        <h2>{randomNumber}</h2>
      </div>

      <div style={{ marginTop: "10px" }}>
        <h1>Random Number Transactions:</h1>
        {randomNumberTransactions.length > 0 ? (
          randomNumberTransactions?.map((transaction) => (
            <div key={transaction}>
              <h2>Transaction Hash: {transaction}</h2>
            </div>
          ))
        ) : (
          <h2>No transactions</h2>
        )}
      </div>

      <div style={{ marginTop: "10px" }}>
        <h1>Current Account:</h1>
        <h2>Account ID: {accounts.length > 0 ? accounts[0].id : 0}</h2>
        <h2>
          Account Balance (ETH): {accounts.length > 0 ? accounts[0].balance : 0}
        </h2>
      </div>
    </div>
  );
}

export default App;
