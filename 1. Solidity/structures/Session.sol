// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "../enumerations/WorkflowStatus.sol";

struct Session {
    WorkflowStatus workflowStatus;
    uint[] proposalIds;
    mapping(uint => address[]) votes;
}