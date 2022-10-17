// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./contracts/BaseVotingContract.sol";
import "./structures/Session.sol";
import "./enumerations/WorkflowStatus.sol";

contract Voting is BaseVotingContract {

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event WinnerRegistered(uint proposalId);
    event ResetSession();

    uint private _winningProposalId;
    Session private _session;

    constructor() {
        _setSessionWorkflowStatus(WorkflowStatus.RegisteringVoters);
    }

    /**
     * @dev Throws if proposal exists
     */
    modifier checkProposalExists(uint _proposalId) {
        require(_session.proposals.length > 0, "Voting: Proposal not exists (list is empty)");

        uint proposalCount = _session.proposals.length;
        bool isProposal = false;
        uint cpt = 0;

        do{
            if (_session.proposals[cpt].id == _proposalId) {
                isProposal = true;
            }
            cpt++;
        } while(isProposal == false && cpt < proposalCount);

        require(isProposal == true, "Voting: Proposal not exists");
        _;
    }

    /**
     * @dev Throws if proposal not exists
     */
    modifier checkProposalNotExists(uint _proposalId) {
        uint proposalCount = _session.proposals.length;

        if (proposalCount > 0) {
            uint cpt = 0;

            do{
                require(_session.proposals[cpt].id != _proposalId, "Voting: Proposal exists");
                cpt++;
            } while(cpt < proposalCount);
        }

        _;
    }

    /**
     * @dev Throws if current WorkflowStatus isn't correct
     */
    modifier checkCurrentWorkflowStatus(WorkflowStatus _WorkflowStatus) {
        require(_session.workflowStatus == _WorkflowStatus, "Voting: WorkflowStatus isn't correct");
        _;
    }

    /**
     * @dev Throws if current WorkflowStatus between two includes status
     */
    modifier checkCurrentWorkflowStatusBetweenIncludesValues(WorkflowStatus _WorkflowStatusStart, WorkflowStatus _WorkflowStatusEnd) {
        uint currentStatus = uint(_session.workflowStatus);
        uint statusStart = uint(_WorkflowStatusStart);
        require(currentStatus >= statusStart, "Voting: WorkflowStatus is too lower");
        uint statusEnd = uint(_WorkflowStatusEnd);
        require(currentStatus <= statusEnd, "Voting: WorkflowStatus is too higher");
        _;
    }

    /**
     * @dev Set session WorkflowStatus
     * Can only be called by the current admin
     */
    function _setSessionWorkflowStatus(WorkflowStatus _WorkflowStatus) private isAdmin {
        require(_session.workflowStatus != _WorkflowStatus, "Voting: Session is currently in this status");

        emit WorkflowStatusChange(_session.workflowStatus, _WorkflowStatus);
        _session.workflowStatus = _WorkflowStatus;
    }

    /**
     * @dev Set session WorkflowStatus to ProposalsRegistrationStarted
     * Can only be called by the current admin
     */
    function proposalsRegistrationStarted() external isAdmin checkCurrentWorkflowStatus(WorkflowStatus.RegisteringVoters) {
        _setSessionWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Set session WorkflowStatus to ProposalsRegistrationEnded
     * Can only be called by the current admin
     */
    function proposalsRegistrationEnded() external isAdmin checkCurrentWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        _setSessionWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Set session WorkflowStatus to VotingSessionStarted
     * Can only be called by the current admin
     */
    function votingSessionStarted() external isAdmin checkCurrentWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded) {
        _setSessionWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Set session WorkflowStatus to VotingSessionEnded
     * Can only be called by the current admin
     */
    function votingSessionEnded() external isAdmin checkCurrentWorkflowStatus(WorkflowStatus.VotingSessionStarted) {
        _setSessionWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev Propose a proposal
     * Can only be called by a voter
     */
    function propose(uint _proposalId, string calldata _description) external isVoter checkCurrentWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) checkProposalNotExists(_proposalId) {
        _session.proposals.push(Proposal(_proposalId, _description, 0));
        emit ProposalRegistered(_proposalId);
    }

    /**
     * @dev Get list of proposals
     * Can only be called by a voter
     */
    function getProposalsList() external isVoter view returns(string memory) {
        require(_session.proposals.length > 0, "Voting: Proposal not exists (list is empty)");

        string memory result = "";
        uint proposalCount = _session.proposals.length;

        for (uint cpt=0 ; cpt<proposalCount; cpt++) {
            Proposal memory proposal = _session.proposals[cpt];
            string memory strId = Strings.toString(proposal.id);
            result = string.concat(string.concat(result, strId), ", ");
        }
        
        return result;
    }

    /**
     * @dev Vote for an existing proposal
     * Can only be called by a voter
     */
    function vote(uint _proposalId) external isVoter checkCurrentWorkflowStatus(WorkflowStatus.VotingSessionStarted) checkProposalExists(_proposalId) {
        require(_voters[_msgSender()].hasVoted == false, "Voting: sender has already voted");
        _voters[_msgSender()].votedProposalId = _proposalId;
        _voters[_msgSender()].hasVoted = true;
        _session.votes[_proposalId].push(_msgSender());
        emit Voted(_msgSender(), _proposalId);
    }

    /**
     * @dev Get the vote of a voter
     * Can only be called by a voter
     */
    function getVote(address _address) external view isVoter checkCurrentWorkflowStatusBetweenIncludesValues(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotesTallied) returns(uint) {
        require(_voters[_address].hasVoted == true, "Voting: This address hasn't voted");
        return _voters[_address].votedProposalId;
    }

    /**
     * @dev Determine the proposal winner
     * Can only be called by the current admin
     */
    function determineProposalWinner() external isAdmin checkCurrentWorkflowStatus(WorkflowStatus.VotingSessionEnded) {
        
        Proposal memory currentWinnerProposal;
        uint proposalCount = _session.proposals.length;

        for (uint cpt=0 ; cpt<proposalCount; cpt++) {
            Proposal storage proposal = _session.proposals[cpt];
            proposal.voteCount = _session.votes[proposal.id].length;

            // Actuellement c'est le premier de la liste qui gagne
            if (proposal.voteCount > currentWinnerProposal.voteCount) {
                currentWinnerProposal = proposal;
            }
            else if (proposal.voteCount == currentWinnerProposal.voteCount) {
                // @correcteur on pourrait faire gagner celui qui a reçu le nombre de vote en premier
                // pour ça récupérer le dernier timestamp de chaque proposal et garder celui qui a le plus petit
            }
        }

        _winningProposalId = currentWinnerProposal.id;
        _setSessionWorkflowStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Get the current WorkflowStatus
     * Can be called by everyone
     */
    function getCurrentWorkflowStatus() external view returns(uint) {
        return uint(_session.workflowStatus);
    }

    /**
     * @dev Get the current winner proposal id
     * Can be called by everyone
     */
    function getWinnerProposalId() external view checkCurrentWorkflowStatus(WorkflowStatus.VotesTallied) returns(uint) {
        return _winningProposalId;
    }

    /**
     * @dev Reset the current session and this voters
     * Can only be called by the current admin
     */
    function resetSessionAndVoters() external isAdmin {
        require(_session.proposals.length > 0, "No session data to clean");

        uint proposalCount = _session.proposals.length;

        for (uint cpt=proposalCount; cpt>0; cpt--) {
            uint proposalId = _session.proposals[cpt-1].id;
            resetProposalVoters(proposalId);

            _session.proposals.pop();
        }

        _winningProposalId = 0;
        _setSessionWorkflowStatus(WorkflowStatus.RegisteringVoters);
        emit ResetSession();
    }
    /**
     * @dev Reset the voters of a proposal
     * Can only be called by the current admin
     */
    function resetProposalVoters(uint proposalId) private isAdmin {

        address[] storage proposalVoters = _session.votes[proposalId];
        uint proposalVoterCount = proposalVoters.length;

        require(proposalVoterCount > 0, "No proposal's voters to clean");

        for (uint cpt=proposalVoterCount; cpt>0; cpt--) {
            address proposalVoter = proposalVoters[cpt-1];
            resetVoterVote(proposalVoter);
            proposalVoters.pop();
        }
    }
}