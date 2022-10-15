// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "./BaseContract.sol";
import "./../structures/Voter.sol";

abstract contract BaseVotingContract is BaseContract {

    event VoterRegistered(address);
    event VoterWhitelistStatusSetted(address, uint);
    event VoterVote(address, uint);
    event VoterResetVote(address);

    mapping(address => Voter) internal _voters;

    /**
     * @dev Throws if called by any account other than the admin.
     */
    modifier isAdmin() {
        _checkAdmin();
        _;
    }

    /**
     * @dev Throws if called by any account other than a voter.
     */
    modifier isVoter() {
        _checkVoter();
        _;
    }

    /**
     * @dev Throws if the sender is not an admin.
     */
    function _checkAdmin() private view {
        require(owner() == _msgSender(), "BaseVoting: Caller is not an admin");
    }

    /**
     * @dev Throws if the sender is not a voter.
     */
    function _checkVoter() private view {
        require(getVoterWhitelistStatus(_msgSender()) == WhitelistStatus.Authorized, "BaseVoting: Caller is not a voter");
    }

    /**
     * @dev Returns a voter wWhitelistSatut
     * Can only be called by the current admin
     */
    function getVoterWhitelistStatus(address _address) internal view isAdmin returns(WhitelistStatus) {
        return _voters[_address].whitelistStatus;
    }

    /**
     * @dev Added a voter
     * Can only be called by the current admin
     */
    function addVoter(address _address, WhitelistStatus _whitelistStatus) public isAdmin {
        _voters[_address] = Voter(_whitelistStatus, false, 0);
        emit VoterRegistered(_address);
    }

    /**
     * @dev Update a voter WhitelistSatut
     * Can only be called by the current admin
     */
    function setVoterWhitelistStatus(address _address, WhitelistStatus _whitelistStatus) public isAdmin {
        _voters[_address].whitelistStatus = _whitelistStatus;
        emit VoterWhitelistStatusSetted(_address, uint(_whitelistStatus));
    }

    /**
     * @dev Reset a voter vote
     * Can only be called by the current admin
     */
    function resetVoterVote(address _address) internal isAdmin {
        _voters[_address].votedProposalId = 0;
        _voters[_address].hasVoted = false;
        emit VoterResetVote(_address);
    }
}