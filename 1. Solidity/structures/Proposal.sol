// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

struct Proposal {
    uint id; // J'ai besoin de stocker la clé
    string description;
    uint voteCount;
}
