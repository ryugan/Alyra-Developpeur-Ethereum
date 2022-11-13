import { Component } from 'react';
import { ethers } from 'ethers';
import LogLevel from '../../enumerations/logLevel';
import { Voting } from '../../typechain-types/contracts';
import { Voting__factory as VotingFactory} from '../../typechain-types/factories/contracts';
import { getMetamaskAccounts, getMetamaskSignedContract } from '../../helpers/contractHelper';
import './voter.component.css';

class VoterComponent extends Component<{onAddLog: Function}> {

    contractAddress: string = '';

    state = {
        getVoterAddress: '',
        getOneProposal: '',
        addProposal: '',
        setVote: ''
    }

    constructor(props:any) {
        super(props);

        this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';

        if (this.contractAddress === '') {
            this.logError('Add Voter', 'Contract address is empty');
        }

        this.onGetVoterChange = this.onGetVoterChange.bind(this);
        this.onGetOneProposalChange = this.onGetOneProposalChange.bind(this);
        this.onAddProposalChange = this.onAddProposalChange.bind(this);
        this.onSetVoteChange = this.onSetVoteChange.bind(this);
        this.onGetVoterClick = this.onGetVoterClick.bind(this);
        this.onGetOneProposalClick = this.onGetOneProposalClick.bind(this);
        this.onAddProposalClick = this.onAddProposalClick.bind(this);
        this.onSetVoteClick = this.onSetVoteClick.bind(this);
        this.onGetWinningClick = this.onGetWinningClick.bind(this);
    }

    componentDidMount() {
        this.addEmitsListener();
    }

    addEmitsListener() {
        const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;
        contract.on('ProposalRegistered', (proposalId:string) => this.logSuccess(`Success - emit ProposalRegistered : ${proposalId}`));
        contract.on('Voted', (address: string, proposalId: ethers.BigNumber,) => this.logSuccess(`Success - emit Voted : address ${address}, proposalId ${proposalId.toString()}`));
    }

    logNormal(message: string) {
        this.props.onAddLog({level: LogLevel.normal, date: new Date(), message: message});
    }

    logSuccess(message: string) {
        this.props.onAddLog({level: LogLevel.success, date: new Date(), message: message});
    }

    logError(origine: string, error: any) {

        let errorMessage: string = 'Open your console to maybe have more information';

        if (typeof error === 'string') {
            errorMessage = error;
        }
        else if (error != null) {
            
            if (typeof error.reason === 'string') {
                const reason: string = (error.reason as string) ?? '';

                if (reason.length > 0) {

                    errorMessage = reason.replace('Error:', '')
                                        .replace('VM Exception while processing transaction: ', '');
                }
            }
            else if (typeof error.message === 'string') {
                errorMessage = error.message;
            }
        }

        this.props.onAddLog({level: LogLevel.error, date: new Date(), message:`Error - ${origine} : ${errorMessage}`});
    }

    onGetVoterChange(e:any) {
        this.setState({getVoterAddress: e.target.value});
    }

    onGetOneProposalChange(e:any) {
        this.setState({getOneProposal: e.target.value});
    }

    onAddProposalChange(e:any) {
        this.setState({addProposal: e.target.value});
    }

    onSetVoteChange(e:any) {
        this.setState({setVote: e.target.value});
    }

    async onGetVoterClick() {

        if (this.state.getVoterAddress == null || this.state.getVoterAddress === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                const voter: Voting.VoterStructOutput = await contract.getVoter(this.state.getVoterAddress, {from: accounts[0]}); 
                const registed: string = voter[0] ? 'est enregistré' : 'non enregistré';
                const voted: string = voter[1] ? 'a voté' : 'n\'a pas voté';
                const votedProposalId: string = voter[2].toNumber() > 0 ? `pour ${voter[2].toString()}` : '';

                this.logNormal(`Get Voter ${this.state.getVoterAddress} : ${registed} et ${voted} ${votedProposalId}`);
            }
            catch(e) {
                this.logError('Get Voter', e);
            }
        }
    }

    async onGetOneProposalClick() {

        if (this.state.getOneProposal == null || this.state.getOneProposal === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;
            const proposalId:ethers.BigNumber = ethers.BigNumber.from(this.state.getOneProposal);

            try {
                const proposal: Voting.ProposalStructOutput = await contract.getOneProposal(proposalId, {from: accounts[0]});
                const description: string = proposal[0];
                const voteCount: number = proposal[1].toNumber();

                this.logNormal(`Get One Proposal ${this.state.getVoterAddress} : La proposal ${description} dispose de ${voteCount} vote(s)`);
            }
            catch(e) {
                this.logError('Get One Proposal', e);
            }
        }
    }

    async onAddProposalClick() {

        if (this.state.addProposal == null || this.state.addProposal === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.addProposal(this.state.addProposal, {from: accounts[0]});  
            }
            catch(e) {
                this.logError('Add Proposal', e);
            }
        }
    }

    async onSetVoteClick() {

        if (this.state.setVote == null || this.state.setVote === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;
            const voteId:ethers.BigNumber = ethers.BigNumber.from(this.state.setVote);

            try {
                await contract.setVote(voteId, {from: accounts[0]});  
            }
            catch(e) {
                this.logError('Set Vote', e);
            }
        }
    }

    async onGetWinningClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                const winningProposalID: ethers.BigNumber = await contract.winningProposalID({from: accounts[0]});
                const message: string = winningProposalID.toNumber() > 0 ? `Get Winning Id : Le vainqueur est ${winningProposalID}` : 'Le vainqueur n\'a pas encore été désigné';
                this.logNormal(message);
            } 
            catch(e) {
                this.logError('Winning Id', e);
            }
        }
    }

    render() {

        return (
            <>
                <h2 className="voter-title">Voter</h2>

                <div className="voter-body">
                    <label className="voter-label">Get Voter :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Address" onChange={this.onGetVoterChange}/>
                    <button className="button button-text" onClick={this.onGetVoterClick}>Get</button><br />
                    <br />
                    <label className="voter-label">Get One Proposal :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Id" onChange={this.onGetOneProposalChange}/>
                    <button className="button button-text" onClick={this.onGetOneProposalClick}>Get</button><br />
                    <br />
                    <label className="voter-label">Add Proposal :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Description" onChange={this.onAddProposalChange}/>
                    <button className="button button-text" onClick={this.onAddProposalClick}>Add</button><br />
                    <br />
                    <label className="voter-label">Set Vote :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Id" onChange={this.onSetVoteChange}/>
                    <button className="button button-text" onClick={this.onSetVoteClick}>Add</button>
                </div>

                <br /><br /><br /><br />

                <h2 className="voter-title">Anyone</h2>
                <div className="voter-body">
                    <label className="voter-label">Get Winning Id :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only" onClick={this.onGetWinningClick}>Get</button>
                </div>
            </>
        );
    }
}

export default VoterComponent;