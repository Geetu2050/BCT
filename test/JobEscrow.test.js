const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JobEscrow Contract", function () {
  let jobEscrow;
  let owner, client, freelancer, unauthorizedUser, otherClient;
  const TEST_ESCROW_AMOUNT = ethers.parseEther("1.0");
  const TEST_JOB_DESCRIPTION = "Build a simple web application";

  beforeEach(async function () {
    [owner, client, freelancer, unauthorizedUser, otherClient] = await ethers.getSigners();

    const JobEscrowFactory = await ethers.getContractFactory("JobEscrow");
    jobEscrow = await JobEscrowFactory.deploy();
    await jobEscrow.waitForDeployment();
  });

  it("1. test_create_job_success: should create a job with active status and correct escrow", async function () {
    await jobEscrow.connect(client).create_job(
      freelancer.address,
      TEST_ESCROW_AMOUNT,
      TEST_JOB_DESCRIPTION,
      { value: TEST_ESCROW_AMOUNT }
    );

    const [jobClient, jobFreelancer, escrowAmount, status] = await jobEscrow.get_job_info(client.address);

    expect(jobClient).to.equal(client.address);
    expect(jobFreelancer).to.equal(freelancer.address);
    expect(escrowAmount).to.equal(TEST_ESCROW_AMOUNT);
    expect(status).to.equal(1); // STATUS_ACTIVE

    // Verify contract holds the escrow
    const contractBalance = await ethers.provider.getBalance(await jobEscrow.getAddress());
    expect(contractBalance).to.equal(TEST_ESCROW_AMOUNT);
  });

  it("2. test_create_job_insufficient_funds: should revert when sent value is less than escrow", async function () {
    const insufficientValue = ethers.parseEther("0.5");

    await expect(
      jobEscrow.connect(client).create_job(
        freelancer.address,
        TEST_ESCROW_AMOUNT,
        TEST_JOB_DESCRIPTION,
        { value: insufficientValue }
      )
    ).to.be.revertedWith("4"); // E_INSUFFICIENT_FUNDS
  });

  it("3. test_complete_job_success: should mark status completed and transfer funds to freelancer", async function () {
    await jobEscrow.connect(client).create_job(
      freelancer.address,
      TEST_ESCROW_AMOUNT,
      TEST_JOB_DESCRIPTION,
      { value: TEST_ESCROW_AMOUNT }
    );

    const freelancerInitialBalance = await ethers.provider.getBalance(freelancer.address);

    // Client completes the job
    await jobEscrow.connect(client).complete_job(client.address);

    // Verify status
    const [, , , status] = await jobEscrow.get_job_info(client.address);
    expect(status).to.equal(2); // STATUS_COMPLETED

    // Freelancer received escrow amount
    const freelancerFinalBalance = await ethers.provider.getBalance(freelancer.address);
    expect(freelancerFinalBalance - freelancerInitialBalance).to.equal(TEST_ESCROW_AMOUNT);
  });

  it("4. test_complete_job_unauthorized: should revert if non-client attempts completion", async function () {
    await jobEscrow.connect(client).create_job(
      freelancer.address,
      TEST_ESCROW_AMOUNT,
      TEST_JOB_DESCRIPTION,
      { value: TEST_ESCROW_AMOUNT }
    );

    await expect(
      jobEscrow.connect(unauthorizedUser).complete_job(client.address)
    ).to.be.revertedWith("2"); // E_UNAUTHORIZED
  });

  it("5. test_complete_job_already_completed: should revert if trying to complete twice", async function () {
    await jobEscrow.connect(client).create_job(
      freelancer.address,
      TEST_ESCROW_AMOUNT,
      TEST_JOB_DESCRIPTION,
      { value: TEST_ESCROW_AMOUNT }
    );

    await jobEscrow.connect(client).complete_job(client.address);

    await expect(
      jobEscrow.connect(client).complete_job(client.address)
    ).to.be.revertedWith("3"); // E_JOB_ALREADY_COMPLETED
  });

  it("6. test_get_job_info_nonexistent: should revert when querying non-existent job", async function () {
    await expect(
      jobEscrow.get_job_info(otherClient.address)
    ).to.be.revertedWith("4008"); // MISSING_DATA
  });

  it("7. test_multiple_jobs_different_clients: should handle independent jobs cleanly", async function () {
    const amount1 = ethers.parseEther("0.5");
    const amount2 = ethers.parseEther("0.8");

    await jobEscrow.connect(client).create_job(freelancer.address, amount1, "Job 1", { value: amount1 });
    await jobEscrow.connect(otherClient).create_job(freelancer.address, amount2, "Job 2", { value: amount2 });

    const [, , escrow1, status1] = await jobEscrow.get_job_info(client.address);
    const [, , escrow2, status2] = await jobEscrow.get_job_info(otherClient.address);

    expect(escrow1).to.equal(amount1);
    expect(status1).to.equal(1);
    expect(escrow2).to.equal(amount2);
    expect(status2).to.equal(1);
  });

  it("8. test_zero_escrow_amount: should allow zero escrow and complete successfully", async function () {
    await jobEscrow.connect(client).create_job(freelancer.address, 0, "Free job", { value: 0 });

    const [, , escrowAmount, status] = await jobEscrow.get_job_info(client.address);
    expect(escrowAmount).to.equal(0);
    expect(status).to.equal(1);

    await jobEscrow.connect(client).complete_job(client.address);

    const [, , , finalStatus] = await jobEscrow.get_job_info(client.address);
    expect(finalStatus).to.equal(2);
  });
});
