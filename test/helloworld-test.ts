import { expect } from "chai";
import { ethers } from "hardhat";

describe("Hello World Test", () => {
  it("should return the new greeting once it's changed", async () => {
    
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const helloWoldContract = await ethers.getContractAt(
      "HelloWorld",
      contractAddress
    );

    console.log(await helloWoldContract.message());
  });
});
