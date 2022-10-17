// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

struct Proposal {
    uint id; // @correcteur  J'ai besoin de stocker la clé essentiellement pour le lien d'association de la Session (voir commentaire Session.vote)
    string description;
    uint voteCount;
}
