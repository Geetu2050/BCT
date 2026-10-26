// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title JobEscrow
 * @dev Freelance marketplace escrow contract ported from Aptos Move to Solidity
 */
contract JobEscrow {
    /// Error codes matching original Move contract
    uint256 public constant E_JOB_NOT_FOUND = 1;
    uint256 public constant E_UNAUTHORIZED = 2;
    uint256 public constant E_JOB_ALREADY_COMPLETED = 3;
    uint256 public constant E_INSUFFICIENT_FUNDS = 4;
    uint256 public constant MISSING_DATA = 4008;

    /// Job status constants
    uint8 public constant STATUS_ACTIVE = 1;
    uint8 public constant STATUS_COMPLETED = 2;

    /// Struct representing a freelance job with escrow
    struct Job {
        address client;           // Address of the client who posted the job
        address freelancer;       // Address of the assigned freelancer
        uint256 escrow_amount;    // Amount held in escrow (in wei)
        string job_description;   // Job details and requirements
        uint8 status;             // Job status (1 = Active, 2 = Completed)
        uint256 created_at;       // Timestamp when job was created
    }

    /// Mapping of client address => Job
    mapping(address => Job) private jobs;

    /// Events
    event JobCreated(
        address indexed client,
        address indexed freelancer,
        uint256 escrow_amount,
        string job_description,
        uint256 created_at
    );

    event JobCompleted(
        address indexed client,
        address indexed freelancer,
        uint256 escrow_amount
    );

    /**
     * @notice Create a new freelance job with escrow deposit
     * @param freelancer Address of the freelancer
     * @param escrow_amount Expected escrow deposit
     * @param job_description Description of the job
     */
    function create_job(
        address freelancer,
        uint256 escrow_amount,
        string calldata job_description
    ) external payable {
        require(msg.value == escrow_amount, "4"); // E_INSUFFICIENT_FUNDS
        require(freelancer != address(0), "Invalid freelancer address");

        jobs[msg.sender] = Job({
            client: msg.sender,
            freelancer: freelancer,
            escrow_amount: escrow_amount,
            job_description: job_description,
            status: STATUS_ACTIVE,
            created_at: block.timestamp
        });

        emit JobCreated(msg.sender, freelancer, escrow_amount, job_description, block.timestamp);
    }

    /**
     * @notice CamelCase alias for create_job
     */
    function createJob(
        address freelancer,
        string calldata job_description
    ) external payable {
        require(freelancer != address(0), "Invalid freelancer address");

        jobs[msg.sender] = Job({
            client: msg.sender,
            freelancer: freelancer,
            escrow_amount: msg.value,
            job_description: job_description,
            status: STATUS_ACTIVE,
            created_at: block.timestamp
        });

        emit JobCreated(msg.sender, freelancer, msg.value, job_description, block.timestamp);
    }

    /**
     * @notice Function to complete job and release escrow payment
     * @param job_owner Address of the job poster / client
     */
    function complete_job(address job_owner) public {
        Job storage job = jobs[job_owner];

        require(job.status != 0, "1"); // E_JOB_NOT_FOUND
        require(job.client == msg.sender, "2"); // E_UNAUTHORIZED
        require(job.status == STATUS_ACTIVE, "3"); // E_JOB_ALREADY_COMPLETED

        job.status = STATUS_COMPLETED;
        uint256 amount = job.escrow_amount;

        if (amount > 0) {
            (bool success, ) = payable(job.freelancer).call{value: amount}("");
            require(success, "Transfer to freelancer failed");
        }

        emit JobCompleted(job.client, job.freelancer, amount);
    }

    /**
     * @notice CamelCase alias for complete_job
     */
    function completeJob(address job_owner) external {
        complete_job(job_owner);
    }

    /**
     * @notice Helper function to get job details (view function)
     * @param job_owner Address of the job poster
     */
    function get_job_info(address job_owner)
        public
        view
        returns (
            address client,
            address freelancer,
            uint256 escrow_amount,
            uint8 status
        )
    {
        Job storage job = jobs[job_owner];
        require(job.status != 0, "4008"); // MISSING_DATA
        return (job.client, job.freelancer, job.escrow_amount, job.status);
    }

    /**
     * @notice CamelCase alias for get_job_info
     */
    function getJobInfo(address job_owner)
        external
        view
        returns (
            address client,
            address freelancer,
            uint256 escrow_amount,
            uint8 status
        )
    {
        return get_job_info(job_owner);
    }

    /**
     * @notice Get complete job details including description and timestamp
     */
    function get_job_full(address job_owner)
        public
        view
        returns (
            address client,
            address freelancer,
            uint256 escrow_amount,
            string memory job_description,
            uint8 status,
            uint256 created_at
        )
    {
        Job storage job = jobs[job_owner];
        require(job.status != 0, "4008");
        return (
            job.client,
            job.freelancer,
            job.escrow_amount,
            job.job_description,
            job.status,
            job.created_at
        );
    }
}
