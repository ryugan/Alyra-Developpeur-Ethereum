// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "../enumerations/WhitelistStatus.sol";

struct Voter {
    WhitelistStatus whitelistStatus; // @correcteur Je préfère une enum permettant d'indiquer si le voter est inconnu, autorisé ou refusé (voir le commentaire de l'enum)
    bool hasVoted;
    uint votedProposalId;
}
