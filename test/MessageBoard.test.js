const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageBoard & MessageBoardTest (test_end_to_end.sol)", function () {
  it("Should run the exact on-chain Solidity testEndToEnd() from MessageBoardTest", async function () {
    const MessageBoardTestFactory = await ethers.getContractFactory("MessageBoardTest");
    const testContract = await MessageBoardTestFactory.deploy();
    await testContract.waitForDeployment();

    // Call setUp()
    await testContract.setUp();

    // Call testEndToEnd() and verify it succeeds without reverting
    await expect(testContract.testEndToEnd()).to.not.be.reverted;
  });

  it("Should test MessageBoard directly: post 'hello world' then overwrite with 'hello aptos'", async function () {
    const MessageBoardFactory = await ethers.getContractFactory("MessageBoard");
    const messageBoard = await MessageBoardFactory.deploy();
    await messageBoard.waitForDeployment();

    // Step 1: Post initial message
    await messageBoard.postMessage("hello world");
    let content = await messageBoard.getMessageContent();
    expect(content).to.equal("hello world");

    // Step 2: Overwrite with new message
    await messageBoard.postMessage("hello aptos");
    content = await messageBoard.getMessageContent();
    expect(content).to.equal("hello aptos");
  });
});
