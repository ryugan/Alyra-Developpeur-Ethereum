// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "./contracts/BaseVotingContract.sol";

contract Voting is BaseVotingContract {

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event WinnerRegistered(uint proposalId);

    uint private _winningProposalId;
    Session private _session;

    /**
     * @dev Throws if proposal not exists
     */
    modifier checkProposalExists(uint _proposalId) {
        require(_session.proposalIds.length > 0, "Proposal not exists");

        bool isProposal = false;
        uint cpt = 0;

        do{
            if (_session.proposalIds[cpt] == _proposalId) {
                isProposal = true;
            }
            cpt++;
        } while(isProposal == false && cpt < _session.proposalIds.length);

        require(isProposal == false, "Proposal not exists");
        _;
    }

    constructor() {
        _setSessionWorkflowStatus(WorkflowStatus.RegisteringVoters);
    }

    /**
     * @dev Set session WorkflowStatus
     * Can only be called by the current admin
     */
    function _setSessionWorkflowStatus(WorkflowStatus _WorkflowStatus) private isAdmin {
        require(_session.workflowStatus != _WorkflowStatus, "Session is currently in this status");

        emit WorkflowStatusChange(_session.workflowStatus, _WorkflowStatus);
        _session.workflowStatus = _WorkflowStatus;
    }

    /**
     * @dev Set session WorkflowStatus to ProposalsRegistrationStarted
     * Can only be called by the current admin
     */
    function proposalsRegistrationStarted() external isAdmin {
        require(_session.workflowStatus == WorkflowStatus.RegisteringVoters);
        _setSessionWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Set session WorkflowStatus to ProposalsRegistrationEnded
     * Can only be called by the current admin
     */
    function proposalsRegistrationEnded() external isAdmin {
        require(_session.workflowStatus == WorkflowStatus.ProposalsRegistrationStarted);
        _setSessionWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Set session WorkflowStatus to VotingSessionStarted
     * Can only be called by the current admin
     */
    function votingSessionStarted() external isAdmin {
        require(_session.workflowStatus == WorkflowStatus.ProposalsRegistrationEnded);
        _setSessionWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Set session WorkflowStatus to VotingSessionEnded
     * Can only be called by the current admin
     */
    function votingSessionEnded() external isAdmin {
        require(_session.workflowStatus == WorkflowStatus.ProposalsRegistrationStarted);
        _setSessionWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev Propose a proposal
     * Can only be called by a voter
     */
    function propose(uint _proposalId) external isVoter {
        _session.proposalIds.push(_proposalId);
        emit ProposalRegistered(_proposalId);
    }

    /**
     * @dev Vote for an existing proposal
     * Can only be called by a voter
     */
    function vote(uint _proposalId) external isVoter checkProposalExists(_proposalId) {
        _voters[_msgSender()].votedProposalId = _proposalId;
        _voters[_msgSender()].hasVoted;
        emit Voted(_msgSender(), _proposalId);
    }

    /**
     * @dev Get the vote of a voter
     * Can only be called by a voter
     */
    function getVote(address _address) external view isVoter returns(uint) {
        require(_voters[_address].hasVoted == true, "This address hasn't voted");
        return _voters[_address].votedProposalId;
    }

    /**
     * @dev Get the current winner proposal id
     * Can be called by everyone
     */
    function getWinnerProposalId() external view returns(uint) {
        return _winningProposalId;
    }

    /**
     * @dev Determine the proposal winner
     * Can only be called by the current admin
     */
    function determineProposalWinner() external isAdmin {
        
        uint currentWinnerProposalId;
        uint currentWinnerVotesCount;
        uint proposalCount = _session.proposalIds.length;

        for (uint cpt=0 ; cpt<proposalCount; cpt++) {
            uint proposalId = _session.proposalIds[cpt];
            uint votesCount = _session.votes[proposalId].length;

            // Actuellement c'est le premier de la liste qui gagne
            if (votesCount > currentWinnerVotesCount) {
                currentWinnerProposalId = proposalId;
                currentWinnerVotesCount = votesCount;
            }
            else if (votesCount == currentWinnerVotesCount) {
                // todo on pourrait faire gagner celui qui a reçu le nombre de vote en premier
                // pour ça récupérer le dernier timestamp de chaque proposal et garder celui qui a le plus petit
            }
        }

        _winningProposalId = currentWinnerProposalId;
        _setSessionWorkflowStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Reset the current session and this voters
     * Can only be called by the current admin
     */
    function resetSessionAndVoters() external isAdmin {

        uint proposalCount = _session.proposalIds.length;

        for (uint cpt=proposalCount-1; cpt>=0; cpt--) {
            uint proposalId = _session.proposalIds[cpt];
            address[] storage proposalVoters = _session.votes[proposalId];
            uint proposalVoterCount = proposalVoters.length;

            for (uint cpt2=proposalVoterCount-1; cpt2>=0; cpt2--) {
                address proposalVoter = proposalVoters[cpt2];
                resetVoterVote(proposalVoter);
                proposalVoters.pop();
            }

            _session.proposalIds.pop();
        }

        _winningProposalId = 0;
        _setSessionWorkflowStatus(WorkflowStatus.RegisteringVoters);
    }
}