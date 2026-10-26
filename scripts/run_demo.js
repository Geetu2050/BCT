const hre = require("hardhat");

async function main() {
  console.log("============================================================");
  console.log("       SOLIDITY SMART CONTRACT EXECUTION & TEST RUNNER      ");
  console.log("============================================================\n");

  const [deployer, freelancer, client] = await hre.ethers.getSigners();
  console.log(`[Account] Deployer:   ${deployer.address}`);
  console.log(`[Account] Freelancer: ${freelancer.address}`);
  console.log(`[Account] Client:     ${client.address}\n`);

  // -------------------------------------------------------------------------
  // Part 1: Running test_end_to_end.sol (MessageBoardTest)
  // -------------------------------------------------------------------------
  console.log("------------------------------------------------------------");
  console.log(" PART 1: Executing contract/tests/test_end_to_end.sol");
  console.log("------------------------------------------------------------");
  
  console.log("Deploying MessageBoardTest contract from test_end_to_end.sol...");
  const MessageBoardTestFactory = await hre.ethers.getContractFactory("MessageBoardTest");
  const testContract = await MessageBoardTestFactory.deploy();
  await testContract.waitForDeployment();
  console.log(`-> MessageBoardTest deployed to: ${await testContract.getAddress()}`);

  console.log("Calling setUp()...");
  const setUpTx = await testContract.setUp();
  await setUpTx.wait();
  console.log("-> setUp() completed successfully. MessageBoard instance created.");

  console.log("Executing testEndToEnd()...");
  const testTx = await testContract.testEndToEnd();
  const receipt = await testTx.wait();
  console.log(`-> testEndToEnd() transaction hash: ${receipt.hash}`);
  console.log("-> All Solidity assertions in testEndToEnd() PASSED!\n");

  // -------------------------------------------------------------------------
  // Part 2: Direct Interaction with MessageBoard
  // -------------------------------------------------------------------------
  console.log("------------------------------------------------------------");
  console.log(" PART 2: Interactive MessageBoard Inspection");
  console.log("------------------------------------------------------------");
  
  const MessageBoardFactory = await hre.ethers.getContractFactory("MessageBoard");
  const messageBoard = await MessageBoardFactory.deploy();
  await messageBoard.waitForDeployment();
  console.log(`-> MessageBoard contract deployed to: ${await messageBoard.getAddress()}`);

  console.log("\n1. Posting first message: 'hello world'");
  let tx = await messageBoard.postMessage("hello world");
  await tx.wait();
  let content = await messageBoard.getMessageContent();
  console.log(`   MessageBoard content: "${content}"`);

  console.log("\n2. Overwriting with new message: 'hello aptos'");
  tx = await messageBoard.postMessage("hello aptos");
  await tx.wait();
  content = await messageBoard.getMessageContent();
  console.log(`   MessageBoard content: "${content}"\n`);

  // -------------------------------------------------------------------------
  // Part 3: Freelance JobEscrow Contract Demonstration
  // -------------------------------------------------------------------------
  console.log("------------------------------------------------------------");
  console.log(" PART 3: JobEscrow Smart Contract Flow");
  console.log("------------------------------------------------------------");

  const JobEscrowFactory = await hre.ethers.getContractFactory("JobEscrow");
  const jobEscrow = await JobEscrowFactory.deploy();
  await jobEscrow.waitForDeployment();
  console.log(`-> JobEscrow deployed to: ${await jobEscrow.getAddress()}`);

  const escrowAmount = hre.ethers.parseEther("1.5");
  const description = "Build a full-stack dApp frontend + smart contract";

  console.log(`\n1. Client creates job with escrow deposit of 1.5 ETH...`);
  const createJobTx = await jobEscrow.connect(client).create_job(
    freelancer.address,
    escrowAmount,
    description,
    { value: escrowAmount }
  );
  await createJobTx.wait();

  const [jobClient, jobFreelancer, amount, status] = await jobEscrow.get_job_info(client.address);
  console.log(`   Job Client:      ${jobClient}`);
  console.log(`   Job Freelancer:  ${jobFreelancer}`);
  console.log(`   Escrow Amount:   ${hre.ethers.formatEther(amount)} ETH`);
  console.log(`   Job Status:      ${status === 1n ? "1 (ACTIVE)" : status}`);

  const freelancerBalBefore = await hre.ethers.provider.getBalance(freelancer.address);
  console.log(`\n2. Freelancer balance before job completion: ${hre.ethers.formatEther(freelancerBalBefore)} ETH`);

  console.log("\n3. Client approves job completion and releases escrow funds...");
  const completeTx = await jobEscrow.connect(client).complete_job(client.address);
  await completeTx.wait();

  const [, , , updatedStatus] = await jobEscrow.get_job_info(client.address);
  const freelancerBalAfter = await hre.ethers.provider.getBalance(freelancer.address);
  console.log(`   Job Status:      ${updatedStatus === 2n ? "2 (COMPLETED)" : updatedStatus}`);
  console.log(`   Freelancer balance after payout:    ${hre.ethers.formatEther(freelancerBalAfter)} ETH`);
  console.log(`   Net payout received by freelancer:  +${hre.ethers.formatEther(freelancerBalAfter - freelancerBalBefore)} ETH`);

  console.log("\n============================================================");
  console.log("              ALL PROGRAM RUNS COMPLETED SUCCESSFULLY        ");
  console.log("============================================================\n");
}

main().catch((error) => {
  console.error("Execution error:", error);
  process.exit(1);
});
