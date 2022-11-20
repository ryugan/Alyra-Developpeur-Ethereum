// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/utils/Strings.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Contract for voting
 * @author Fabien D.
 * @notice You can use this contract for only voting simulation
 */
contract Voting is Ownable {

    uint public winningProposalID;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(string strProposal);
    event Voted (address voter, uint proposalId);
    
    /**
     * @notice Throws if called by any account other than a voter.
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    /**
     * @notice Map a propostal to a string
     * @dev Internal function without access restriction
     * @param index Proposal's index in array
     * @param proposal Proposal's data
     * @return string
     */
    function mapProposalToString(uint index, Proposal memory proposal) internal pure returns(string memory) {
        return string.concat(Strings.toString(index), "-", proposal.description, "-", Strings.toString(proposal.voteCount));
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Returns if message sender is the current owner
     * @return bool
     */
    function isOwner() external view returns (bool) {
        return owner() == msg.sender;
    }

    /**
     * @notice Returns if message sender is a voter
     * @return bool
     */
    function isVoter() external view returns (bool) {
        return voters[msg.sender].isRegistered;
    }

    /**
     * @notice Returns a voter
     * @dev Can only be called by a voter
     * @param _addr Voter's address
     * @return Voter
     */
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /** @notice Returns a proposal
     * @dev Can only be called by a voter
     * @param _id Proposal's id
     * @return Proposal
     */
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

    /**
     * @notice Returns list of proposals as a string
     * @dev Can only be called by a voter
     * @return string
     */
    function getProposalsList() external onlyVoters view returns(string memory) {
        require(proposalsArray.length > 0, "Voting: Proposal not exists (list is empty)");

        string memory result = "";
        uint proposalCount = proposalsArray.length;

        for (uint cpt=0 ; cpt<proposalCount; cpt++) {
            Proposal memory proposal = proposalsArray[cpt];
            result = string.concat(string.concat(result, mapProposalToString(cpt, proposal)), ", ");
        }
        
        return result;
    }

    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /**
     * @notice Adds a voter
     * @dev Can only be called by the current admin
     * @param _addr Voter's address
     */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /**
     * @notice Adds a proposal
     * @dev Can only be called by a voter
     * @param _desc Proposal's description
     */
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(mapProposalToString(proposalsArray.length-1, proposal));
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @notice Sets a vote
     * @dev Can only be called by a voter
     * @param _id Proposal's index
     */
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /**
     * @notice Starts proposals registering
     * @dev Can only be called by the current admin
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice Ends proposals registering
     * @dev Can only be called by the current admin
     */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @notice Starts voting
     * @dev Can only be called by the current admin
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice Ends voting
     * @dev Can only be called by the current admin
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }


    /**
     * @notice Tallies votes
     * @dev Can only be called by the current admin
     */
   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       uint _winningProposalId;
      for (uint256 p = 0; p < proposalsArray.length; p++) {
           if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
               _winningProposalId = p;
          }
       }
       winningProposalID = _winningProposalId;
       
       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}
