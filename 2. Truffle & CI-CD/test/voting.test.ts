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
    const addProposalStatusError = 'Proposals are not allowed yet';
    const addProposalDescError = 'Vous ne pouvez pas ne rien proposer';
    const endProposalError = 'Registering proposals havent started yet';
    const startVotingError = 'Registering proposals phase is not finished';
    const voteSessionNotStartError = 'Voting session havent started yet';
    const voterAlreadyVotedError = 'You have already voted';
    const proposalNotFoundError = 'Proposal not found';
    const endVotingError = 'Voting session havent started yet';
    const tallyVotesError = 'Current status is not voting session ended';

    let votingInstance: VotingInstance;
 
    async function reinitContract(): Promise<void> {
        votingInstance = await VotingContract.new({from:ownerAccount});
    }

    function getWorkflowCurrentStatus(eventLog:Truffle.TransactionLog<AllEvents> | undefined) : WorkflowStatus | undefined {

        if (eventLog == undefined || eventLog.args == undefined ) {
            return undefined;
        }
        const args:any = eventLog.args;

        return (args?.[1] as BN)?.toNumber() as WorkflowStatus;
    }

    function getVoterProposalIndex(eventLog:Truffle.TransactionLog<AllEvents> | undefined) : BN | undefined {

        if (eventLog == undefined || eventLog.args == undefined ) {
            return undefined;
        }
        const args:any = eventLog.args;

        return args?.[1] as BN;
    }

    function getAddedProposalIndex(eventLog:Truffle.TransactionLog<AllEvents> | undefined) : BN | undefined {

        if (eventLog == undefined || eventLog.args == undefined ) {
            return undefined;
        }
        const args:any = eventLog.args;

        return args?.[0];
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
            
            it("... get winningProposalID is default with Owner", async () => {
                const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});
                expect(currentWinningProposalID).to.be.bignumber.equal(defaultBigNumber);
            });

            it("... get also works with other account", async () => {
                const currentWinningProposalID = await votingInstance.winningProposalID.call({from:unknownAccount});
                expect(currentWinningProposalID).to.be.bignumber.equal(defaultBigNumber);
            });
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

        describe("... test addVoter", () => {

            it("... if is not owner", async () => {
                const addVoterPromise = votingInstance.addVoter(voter1Account, {from:unknownAccount});
                await expectRevert(addVoterPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != RegisteringVoters", async () => {
                    await votingInstance.startProposalsRegistering({from:ownerAccount});
                    const addVoterPromise = votingInstance.addVoter(voter1Account, {from:ownerAccount});
                    
                    await expectRevert(addVoterPromise, voterRegistrationError);
                });

                describe("... and workflow == RegisteringVoters", () => {

                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    it("... and can be registrer a not registered's voter", async () => {
                        receipt = await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                        const voter = await votingInstance.getVoter(voter1Account, {from:voter1Account});
                        
                        expect(voter?.isRegistered).to.be.true;
                    });

                    it("... and emit VoterRegistered", async () => {
                        expectEvent(receipt, 'VoterRegistered');
                    });

                    it("... and can be registrer an another not registered's voter", async () => {
                        await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                        await votingInstance.addVoter(voter2Account, {from:ownerAccount});
                        const voter = await votingInstance.getVoter(voter2Account, {from:voter2Account});
                        
                        expect(voter?.isRegistered).to.be.true;
                    });

                    it("... and can't be registrer a registered's voter", async () => {
                        await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                        const addVoterPromise = votingInstance.addVoter(voter1Account, {from:ownerAccount});

                        await expectRevert(addVoterPromise, voterRegisteredError);
                    });
                });
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

                    it("... and emit WorkflowStatusChange", () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });

                    it("... and test current workflow status = ProposalsRegistrationStarted", async () => {
                        const currentStatus: WorkflowStatus | undefined = getWorkflowCurrentStatus(receipt.logs.at(0))
                        expect(currentStatus).to.be.equal(WorkflowStatus.ProposalsRegistrationStarted);
                    });
                });
              
            });
        });

        describe("... test addProposal", () => {

            it("... if not voter", async () => {
                const addProposalPromise = votingInstance.addProposal("", {from:ownerAccount});
                await expectRevert(addProposalPromise, voterError);
            });

            describe("... if is voter", () => {

                beforeEach(async () => {
                    await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                    await votingInstance.addVoter(voter2Account, {from:ownerAccount});
                    await votingInstance.addVoter(voter3Account, {from:ownerAccount});
                });

                it("... and workflow != ProposalsRegistrationStarted", async () => {
                    const endProposalPromise = votingInstance.addProposal("", {from:voter1Account});
                    await expectRevert(endProposalPromise, addProposalStatusError);
                });

                describe("... and workflow == ProposalsRegistrationStarted", () => {

                    beforeEach(async () => {
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                    });

                    it("... and proposal is empty", async () => {
                        const addProposalPromise = votingInstance.addProposal("", {from:voter1Account});
                        await expectRevert(addProposalPromise, addProposalDescError);
                    });

                    describe("... and proposal is not empty ", () => {

                        const voter1Proposal:string = "42";
                        let receipt: Truffle.TransactionResponse<AllEvents>;

                        beforeEach(async () => {
                            receipt = await votingInstance.addProposal(voter1Proposal, {from:voter1Account});
                        });

                        it("... and emit WorkflowStatusChange", () => {
                            expectEvent(receipt, 'ProposalRegistered');
                        });

                        it("... and proposal exists", async () => {
                            const proposalIndex:BN | undefined = getAddedProposalIndex(receipt.logs.at(0));

                            if (proposalIndex == undefined) {
                                assert.fail();
                            }

                            const currentFirstProposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter1Account});
                            expect(currentFirstProposal?.description).to.be.equal(voter1Proposal);
                        });

                        it("... and another addProposal works", async () => {
                            const voter2Proposal:string = "23";
                            const receipt2: Truffle.TransactionResponse<AllEvents> = await votingInstance.addProposal(voter2Proposal, {from:voter2Account});
                            const proposalIndex:BN | undefined = getAddedProposalIndex(receipt2.logs.at(0));

                            if (proposalIndex == undefined) {
                                assert.fail();
                            }

                            const currentFirstProposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter1Account});
                            expect(currentFirstProposal?.description).to.be.equal(voter2Proposal);
                        });
                    });
                });
            });
        });

        describe("... test getOneProposal", () => {
            
            const indexNotExists:BN = new BN(42);

            it("... if not voter", async () => {
                const getOneProposalPromise = votingInstance.getOneProposal(indexNotExists, {from:ownerAccount});
                await expectRevert(getOneProposalPromise, voterError);
            });

            describe("... if is voter", () => {

                beforeEach(async () => {
                    await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                    await votingInstance.startProposalsRegistering({from:ownerAccount});
                });

                it("... and proposal not exists raw error", async () => {
                    const getOneProposalPromise = votingInstance.getOneProposal(indexNotExists, {from:voter1Account});
                    await expectRevert.unspecified(getOneProposalPromise);
                });

                it("... and proposal exists", async () => {
                    const voter1Proposal:string = "42";
                    const receipt1: Truffle.TransactionResponse<AllEvents> = await votingInstance.addProposal(voter1Proposal, {from:voter1Account});
                    const proposalIndex:BN | undefined = getAddedProposalIndex(receipt1.logs.at(0));

                    if (proposalIndex == undefined) {
                        assert.fail();
                    }

                    const currentFirstProposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter1Account});
                    expect(currentFirstProposal?.description).to.be.equal(voter1Proposal);
                });
            });
        });

        describe("... test endProposalsRegistering", () => {
            
            it("... if is not owner", async () => {
                const endProposalPromise = votingInstance.endProposalsRegistering({from:unknownAccount});
                await expectRevert(endProposalPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != ProposalsRegistrationStarted", async () => {
                    const endProposalPromise = votingInstance.endProposalsRegistering({from:ownerAccount});
                    await expectRevert(endProposalPromise, endProposalError);
                });

                describe("... and workflow == ProposalsRegistrationStarted", () => {

                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    before(async () => {
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        receipt = await votingInstance.endProposalsRegistering({from:ownerAccount});
                    });

                    it("... and emit WorkflowStatusChange", async () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });

                    it("... and test current workflow status = ProposalsRegistrationEnded", async () => {
                        const currentStatus: WorkflowStatus | undefined = getWorkflowCurrentStatus(receipt.logs.at(0));
                        expect(currentStatus).to.be.equal(WorkflowStatus.ProposalsRegistrationEnded);
                    });
                });
            });
        });

        describe("... test startVotingSession", () => {
            
            it("... if is not owner", async () => {
                const startVotingPromise = votingInstance.startVotingSession({from:unknownAccount});
                await expectRevert(startVotingPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != ProposalsRegistrationEnded", async () => {
                    const startVotingPromise = votingInstance.startVotingSession({from:ownerAccount});
                    await expectRevert(startVotingPromise, startVotingError);
                });

                describe("... and workflow == ProposalsRegistrationEnded", () => {

                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    before(async () => {
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        await votingInstance.endProposalsRegistering({from:ownerAccount});
                        receipt = await votingInstance.startVotingSession({from:ownerAccount});
                    });

                    it("... and emit WorkflowStatusChange", async () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });

                    it("... and test current workflow status = VotingSessionStarted", async () => {
                        const currentStatus: WorkflowStatus | undefined = getWorkflowCurrentStatus(receipt.logs.at(0));
                        expect(currentStatus).to.be.equal(WorkflowStatus.VotingSessionStarted);
                    });
                });
            });     
        });

        describe("... test setVote", () => {

            const firstVote:BN = new BN(0);
            const secondVote:BN = new BN(1);

            it("... if not voter", async () => {
                const getOneProposalPromise = votingInstance.setVote(firstVote, {from:ownerAccount});
                await expectRevert(getOneProposalPromise, voterError);
            });

            describe("... if is voter", () => {

                beforeEach(async () => {
                    await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                    await votingInstance.addVoter(voter2Account, {from:ownerAccount});
                });

                it("... and workflow != VotingSessionStarted", async () => {
                    const setVotePromise = votingInstance.setVote(firstVote, {from:voter1Account});
                    await expectRevert(setVotePromise, voteSessionNotStartError);
                });

                describe("... and workflow == VotingSessionStarted", () => {

                    beforeEach(async () => {   
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        await votingInstance.addProposal("42", {from:voter1Account});
                        await votingInstance.addProposal("23", {from:voter2Account});
                        await votingInstance.endProposalsRegistering({from:ownerAccount});
                        await votingInstance.startVotingSession({from:ownerAccount});
                    });

                    it("... first voter has already voted", async () => {
                        await votingInstance.setVote(firstVote, {from:voter1Account});
                        const setVotePromise = votingInstance.setVote(firstVote, {from:voter1Account});
                        await expectRevert(setVotePromise, voterAlreadyVotedError);
                    });

                    describe("... and first voter hasn't voted", () => {

                        it("... proposal not found", async () => {
                            const setVotePromise = votingInstance.setVote(42, {from:voter1Account});
                            await expectRevert(setVotePromise, proposalNotFoundError);
                        });

                        describe("... and proposal found", () => {

                            let receipt: Truffle.TransactionResponse<AllEvents>;

                            beforeEach(async () => {
                                receipt = await votingInstance.setVote(firstVote, {from:voter1Account});
                            });

                            it("... and voter has voted", async () => {
                                const voter:Voter = await votingInstance.getVoter(voter1Account, {from:voter1Account});
                                expect(voter?.hasVoted).to.be.true;
                            });

                            it("... and voter change votedProposalId", async () => {
                                const voter:Voter = await votingInstance.getVoter(voter1Account, {from:voter1Account});
                                expect(voter?.votedProposalId).to.be.bignumber.equal(firstVote);
                            });

                            it("... and emit WorkflowStatusChange", async () => {
                                expectEvent(receipt, 'Voted');
                            });
                            
                            it("... and increment proposal vote count", async () => {
                                const proposalIndex: BN | undefined = getVoterProposalIndex(receipt.logs.at(0));

                                if (proposalIndex == undefined) {
                                    assert.fail();
                                }

                                const proposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter1Account});
                                expect(proposal?.voteCount).to.be.bignumber.equal(new BN(1));
                            });
                        });
                    });

                    describe("... and two voters voted", () => {
                            
                        it("... and first voter has'nt voted", async () => {
                            const receipt: Truffle.TransactionResponse<AllEvents> = await votingInstance.setVote(secondVote, {from:voter2Account});
                            const proposalIndex: BN | undefined = getVoterProposalIndex(receipt.logs.at(0));

                            if (proposalIndex == undefined) {
                                assert.fail();
                            }

                            const proposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter2Account});
                            expect(proposal?.voteCount).to.be.bignumber.equal(new BN(1));
                        });

                        it("... and first voter has already voted for another proposal", async () => {
                            await votingInstance.setVote(firstVote, {from:voter1Account});
                            const receipt: Truffle.TransactionResponse<AllEvents> = await votingInstance.setVote(secondVote, {from:voter2Account});
                            const proposalIndex: BN | undefined = getVoterProposalIndex(receipt.logs.at(0));

                            if (proposalIndex == undefined) {
                                assert.fail();
                            }

                            const proposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter2Account});
                            expect(proposal?.voteCount).to.be.bignumber.equal(new BN(1));
                        });

                                
                        it("... and two voters voted for the same proposal", async () => {
                            await votingInstance.setVote(firstVote, {from:voter1Account});
                            const receipt: Truffle.TransactionResponse<AllEvents> = await votingInstance.setVote(firstVote, {from:voter2Account});
                            const proposalIndex: BN | undefined = getVoterProposalIndex(receipt.logs.at(0));

                            if (proposalIndex == undefined) {
                                assert.fail();
                            }

                            const proposal:Proposal = await votingInstance.getOneProposal(proposalIndex, {from:voter2Account});
                            expect(proposal?.voteCount).to.be.bignumber.equal(new BN(2));
                        });
                    });
                });
            });
        });

        describe("... test endVotingSession", () => {
            
            it("... if is not owner", async () => {
                const endVotingPromise = votingInstance.endVotingSession({from:unknownAccount});
                await expectRevert(endVotingPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != VotingSessionStarted", async () => {
                    const endVotingPromise = votingInstance.endVotingSession({from:ownerAccount});
                    await expectRevert(endVotingPromise, endVotingError);
                });

                describe("... and workflow == VotingSessionStarted", () => {

                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    before(async () => {
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        await votingInstance.endProposalsRegistering({from:ownerAccount});
                        await votingInstance.startVotingSession({from:ownerAccount});
                        receipt = await votingInstance.endVotingSession({from:ownerAccount});
                    });

                    it("... and emit WorkflowStatusChange", async () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });

                    it("... and test current workflow status = VotingSessionEnded", async () => {
                        const currentStatus: WorkflowStatus | undefined = getWorkflowCurrentStatus(receipt.logs.at(0));
                        expect(currentStatus).to.be.equal(WorkflowStatus.VotingSessionEnded);
                    });
                });
            });     
        });

        describe("... test tallyVotes", () => {

            it("... if is not owner", async () => {
                const tallyVotesPromise = votingInstance.tallyVotes({from:unknownAccount});
                await expectRevert(tallyVotesPromise, ownableError);
            });

            describe("... if is owner", () => {

                it("... and workflow != VotingSessionEnded", async () => {
                    const tallyVotesPromise = votingInstance.tallyVotes({from:ownerAccount});
                    await expectRevert(tallyVotesPromise, tallyVotesError);
                });

                describe("... and workflow == VotingSessionEnded", () => {

                    let receipt: Truffle.TransactionResponse<AllEvents>;

                    before(async () => {
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        await votingInstance.endProposalsRegistering({from:ownerAccount});
                        await votingInstance.startVotingSession({from:ownerAccount});
                        await votingInstance.endVotingSession({from:ownerAccount});
                        receipt = await votingInstance.tallyVotes({from:ownerAccount});
                    });

                    it("... and emit WorkflowStatusChange", async () => {
                        expectEvent(receipt, 'WorkflowStatusChange');
                    });

                    it("... and test current workflow status = VotesTallied", async () => {
                        const currentStatus: WorkflowStatus | undefined = getWorkflowCurrentStatus(receipt.logs.at(0));
                        expect(currentStatus).to.be.equal(WorkflowStatus.VotesTallied);
                    });

                    it("... get winningProposalID is default with Owner", async () => {
                        const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});
                        expect(currentWinningProposalID).to.be.bignumber.equal(defaultBigNumber);
                    });
                });

                describe("... and integration tests ", () => {

                    const firstVote:BN = new BN(0);
                    const secondVote:BN = new BN(1);
                    const thirdVote:BN = new BN(2);

                    beforeEach(async () => {
                        await votingInstance.addVoter(voter1Account, {from:ownerAccount});
                        await votingInstance.addVoter(voter2Account, {from:ownerAccount});
                        await votingInstance.addVoter(voter3Account, {from:ownerAccount});
                        await votingInstance.startProposalsRegistering({from:ownerAccount});
                        await votingInstance.addProposal("42", {from:voter1Account});
                        await votingInstance.addProposal("23", {from:voter2Account});
                        await votingInstance.addProposal("666", {from:voter3Account});
                        await votingInstance.endProposalsRegistering({from:ownerAccount});
                        await votingInstance.startVotingSession({from:ownerAccount});
                    });

                    it("... and only 1 vote for the 1st and 1st winner", async () => {
                        await votingInstance.setVote(firstVote, {from:voter1Account});
                        await votingInstance.endVotingSession({from:ownerAccount});
                        await votingInstance.tallyVotes({from:ownerAccount});
                        const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});

                        expect(currentWinningProposalID).to.be.bignumber.equal(firstVote);
                    });

                    it("... and 1 vote for the 1st, 1 for 2nd and 1 for the 3rd and the 1st winner", async () => {
                        await votingInstance.setVote(firstVote, {from:voter1Account});
                        await votingInstance.setVote(secondVote, {from:voter2Account});
                        await votingInstance.setVote(thirdVote, {from:voter3Account});
                        await votingInstance.endVotingSession({from:ownerAccount});
                        await votingInstance.tallyVotes({from:ownerAccount});
                        const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});
                        
                        expect(currentWinningProposalID).to.be.bignumber.equal(firstVote);
                    });

                    it("... and 1 vote for the 1st, 2 for 2nd and 0 for the 3rd and the 2nd winner", async () => {
                        await votingInstance.setVote(firstVote, {from:voter1Account});
                        await votingInstance.setVote(secondVote, {from:voter2Account});
                        await votingInstance.setVote(secondVote, {from:voter3Account});
                        await votingInstance.endVotingSession({from:ownerAccount});
                        await votingInstance.tallyVotes({from:ownerAccount});
                        const currentWinningProposalID = await votingInstance.winningProposalID.call({from:ownerAccount});
                        
                        expect(currentWinningProposalID).to.be.bignumber.equal(secondVote);
                    });
                });
            });   
        });
    });
});