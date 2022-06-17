import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "helloWorld",
  "Connects to HelloWorld Contract and Prints the message"
).setAction(async (args, hre) => {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const helloWoldContract = await hre.ethers.getContractAt(
    "HelloWorld",
    contractAddress
  );

  console.log(await helloWoldContract.message());
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const account = hre.web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await hre.web3.eth.getBalance(account);

    console.log(hre.web3.utils.fromWei(balance, "ether"), "ETH");
  });


const PRIVATE_KEY = process.env.PRIVATE_KEY;
const KOVAN_API_KEY = process.env.KOVAN_API_KEY;

  
const KOVAN_RPC_URL =
  process.env.KOVAN_RPC_URL ||
  `https://eth-kovan.alchemyapi.io/v2/${KOVAN_API_KEY}`;

module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kovan: {
      url: KOVAN_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 42,
    },
  },
};
