// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "./Proposal.sol";
import "../enumerations/WorkflowStatus.sol";

struct Session {
    WorkflowStatus workflowStatus;
    Proposal[] proposals;
    mapping(uint => address[]) votes; // @correcteur Lien d'association permettant de facilement identifier les votants (pour les compter, pour vérifier l'existance / la non existance et pour le reset)
}