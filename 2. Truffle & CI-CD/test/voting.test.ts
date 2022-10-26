const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
import { expect } from 'chai';
import { VotingContract, VotingInstance } from '../types/truffle-contracts';

contract("Voting", accounts => {

    const VotingContract: VotingContract = artifacts.require("Voting");
    const owner:string = accounts[0];
    let votingInstance: VotingInstance;
 
    describe("test complet", function () {
        beforeEach(async () => votingInstance = await VotingContract.new({from:owner}));
    
        it("...", async () => {

        });
    });
});