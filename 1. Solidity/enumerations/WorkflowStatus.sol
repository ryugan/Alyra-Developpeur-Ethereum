// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

enum WorkflowStatus {
    Unknown, // @correcteur Une bonne pratique est de toujours avoir/commencer par une valeur non gérée afin de mettre en lumière des erreurs silencieuses
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}