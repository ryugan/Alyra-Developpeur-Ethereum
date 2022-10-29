const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
import { expect } from 'chai';
import { VotingContract, VotingInstance } from '../types/truffle-contracts';
import { OwnershipTransferred, ProposalRegistered, Voted, VoterRegistered, WorkflowStatusChange } from '../types/truffle-contracts/Voting';

type AllEvents =
  | OwnershipTransferred
  | ProposalRegistered
  | Voted
  | VoterRegistered
  | WorkflowStatusChange;

interface Voter {
    isRegistered: boolean; 
    hasVoted: boolean;
    votedProposalId: BN;
}

interface Proposal {
    description: string; 
    voteCount: BN;
}

enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}

contract("Voting", accounts => {

    const VotingContract: VotingContract = artifacts.require("Voting");

    const ownerAccount:string = accounts[0];
    const voter1Account:string = accounts[1];
    const voter2Account:string = accounts[2];
    const voter3Account:string = accounts[3];
    const unknownAccount:string = accounts[4];

    const defaultBigNumber:BN = new BN(0);
    const genesisProposal:string = "GENESIS";

    const ownableError:string = "Ownable: caller is not the owner";
    const voterError:string = "You're not a voter";
    const startProposalError = 'Registering proposals cant be started now';
    const voterRegistrationError:string = 'Voters registration is not open yet';
    const voterRegisteredError:string = 'Already registered';

    let votingInstance: VotingInstance;
 
    async function reinitContract() {
        votingInstance = await VotingContract.new({from:ownerAccount});
    }

    describe("full test", () => {
        beforeEach(reinitContract);
 
        describe("... test constructor", () => {
            
            it("... constructeur owner is owner", async () => {
                const currentOwner = await votingInstance.owner.call({from:ownerAccount});
                expect(currentOwner).to.be.equal(ownerAccount);
            });
        });

        describe("... test winningProposalID", () => {
            
            it("... get winningProposalID  is default with Owner", async () => {
                const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});
                expect(currentWinningProposalID).to.be.bignumber.equal(defaultBigNumber);
            });

            it("... get also works with other account", async () => {
                const currentWinningProposalID = await votingInstance.winningProposalID.call({from:unknownAccount});
                expect(currentWinningProposalID).to.be.bignumber.equal(defaultBigNumber);
            });
        });

        describe("... test startProposalsRegistering", () => {
            
            it("... if is not owner", async () => {
                const startProposalPromise = votingInstance.startProposalsRegistering({from:unknownAccount});
                await expectRevert(startProposalPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != RegisteringVoters", async () => {
                    await votingInstance.startProposalsRegistering({from:ownerAccount});
                    const startProposalPromise = votingInstance.startProposalsRegistering({from:ownerAccount});
                    await expectRevert(startProposalPromise, startProposalError);
                });

                describe("... and workflow == RegisteringVoters", () => {

                    let currentFirstProposal:Proposal;
                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    before(async () => {
                        await reinitContract();
                        await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                        receipt = await votingInstance.startProposalsRegistering({from:ownerAccount});
                        currentFirstProposal = await votingInstance.getOneProposal(0, {from:voter1Account});
                    });

                    it("... and proposal genesis exists", async () => {     
                        expect(currentFirstProposal?.description).to.be.equal(genesisProposal);
                    });
                    
                    it("... and proposal genesis does'nt have vote", async () => {     
                        expect(currentFirstProposal?.voteCount).to.be.bignumber.equal(defaultBigNumber);
                    });

                    it("... and test emit", () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });
                });
              
            });
        });
/*
        describe("... test addVoter", () => {

            it("... if is not owner", async () => {
                const addVoterPromise = votingInstance.addVoter(voter1Account, {from:unknownAccount});
                await expectRevert(addVoterPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != RegisteringVoters", async () => {
                    await votingInstance.startProposalsRegistering();
                    const addVoterPromise = votingInstance.addVoter(voter1Account, {from:ownerAccount});
                    await expectRevert(addVoterPromise, voterRegistrationError);
                });
            });
            

                // And workflow != RegisteringVoters

                // And workflow = RegisteringVoters

                    // And voter is not registered (+ EMIT)

                    // And other voter is not registered (+ EMIT)

                    // And second voter is already registered

                    // Test voter exists now
        });

        describe("... test modifier onlyVoters and getVoter", () => {

            it("...if owner not voter", async () => {
                const getVoterPromise = votingInstance.getVoter(unknownAccount, {from:ownerAccount});
                await expectRevert(getVoterPromise, voterError);
            });

            it("...if not owner not voter", async () => {
                const getVoterPromise = votingInstance.getVoter(ownerAccount, {from:unknownAccount});
                await expectRevert(getVoterPromise, voterError);
            });

            it("...if owner is voter", async () => {
                await votingInstance.addVoter(ownerAccount);
                const voter = await votingInstance.getVoter(ownerAccount, {from:ownerAccount});
                
                expect(voter?.isRegistered).to.be.true;
            });

            it("...if not owner and is voter", async () => {
                await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                const voter = await votingInstance.getVoter(voter1Account, {from:voter1Account});
                
                expect(voter?.isRegistered).to.be.true;
            });
        });
*/
/*
        
        describe("... test getOneProposal", () => {
            
            // Test if not voter

            // Test if is voter and proposal not exists

            // Test if is voter and proposal exists
        });

        

        describe("... test addProposal", () => {
            // Test if not voter

            // Test if is voter 
            
                // And workflow != ProposalsRegistrationStarted

                // And workflow = ProposalsRegistrationStarted

                    // And proposal is empty

                    // And proposal is not empty (+ EMIT)

                    // Test proposal exists now
        });

        describe("... test setVote", () => {
            // Test if not voter

            // Test if is voter 

                // And workflow != VotingSessionStarted

                // And workflow = VotingSessionStarted

                    // And voter not has voted

                        // And proposals not found

                        // And proposals found

                            // Test voter vote

                            // Test voter has vote

                            // Test proposal voteCount

                            // Test EMIT

                    // And voter has voted

                    // And other voter not has voted

                        // And proposals found

                            // Test first voter vote

                            // Test first voter has vote

                            // Test second voter vote

                            // Test second voter has vote

                            // Test proposal voteCount

                            // Test EMIT
        });

        

        describe("... test endProposalsRegistering", () => {
            // Test if not owner

            // Test if is owner 

                // And workflow != ProposalsRegistrationStarted

                // And workflow = ProposalsRegistrationStarted

                    // Test new workflow status = ProposalsRegistrationEnded

                    // Test EMIT
        });

        describe("... test startVotingSession", () => {
            // Test if not owner

            // Test if is owner 

                // And workflow != ProposalsRegistrationEnded

                // And workflow = ProposalsRegistrationEnded

                    // Test new workflow status = VotingSessionStarted

                    // Test EMIT
        });

        describe("... test endVotingSession", () => {
            // Test if not owner

            // Test if is owner 

                // And workflow != VotingSessionStarted

                // And workflow = VotingSessionStarted

                    // Test new workflow status = VotingSessionEnded

                    // Test EMIT
        });

        describe("... test tallyVotes", () => {
            // Test if not owner

            // Test if is owner 

                // And workflow != VotingSessionEnded

                // And workflow = VotingSessionEnded

                    // Test new workflow status = VotesTallied

                    // winningProposalID

                    // Test EMIT
        });
    */
    });
});