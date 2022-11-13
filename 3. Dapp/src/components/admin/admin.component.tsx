import { Component } from 'react';
import { ethers } from 'ethers';
import LogLevel from '../../enumerations/logLevel';
import { Voting } from '../../typechain-types/contracts';
import { Voting__factory as VotingFactory} from '../../typechain-types/factories/contracts';
import { getMetamaskAccounts, getMetamaskSignedContract } from '../../helpers/contractHelper';
import './admin.component.css';

class AdminComponent extends Component<{onAddLog: Function}> {

    contractAddress: string = '';

    state = {
        newVoterAddress: ''
    }

    constructor(props:any) {
        super(props);

        this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';

        if (this.contractAddress === '') {
            this.logError('Add Voter', 'Contract address is empty');
        }

        this.onAddVoterChange = this.onAddVoterChange.bind(this);
        this.onAddVoterClick = this.onAddVoterClick.bind(this);
        this.onStartProposalClick = this.onStartProposalClick.bind(this);
        this.onEndProposalClick = this.onEndProposalClick.bind(this);
        this.onStartVotingClick = this.onStartVotingClick.bind(this);
        this.onEndVotingClick = this.onEndVotingClick.bind(this);
        this.onTallyClick = this.onTallyClick.bind(this);
    }

    componentDidMount() {
        this.addEmitsListener();
    }

    addEmitsListener() {
        const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;
        contract.on('VoterRegistered', (address:string) => this.logSuccess(`Success - emit VoterRegistered : ${address}`));
        contract.on('WorkflowStatusChange', (previousStatus: ethers.BigNumber, newStatus: ethers.BigNumber,) => this.logSuccess(`Success - emit WorkflowStatusChange : previous ${previousStatus.toString()}, next ${newStatus.toString()}`));
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

    onAddVoterChange(e:any) {
        this.setState({newVoterAddress: e.target.value});
    }

    async onAddVoterClick() {

        if (this.state.newVoterAddress == null || this.state.newVoterAddress === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.addVoter(this.state.newVoterAddress, {from: accounts[0]});  
            }
            catch(e) {
                this.logError('Add Voter', e);
            }
        }
    }

    async onStartProposalClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.startProposalsRegistering({from: accounts[0]});  
            }
            catch(e) {
                this.logError('Start Proposal', e);
            }
        }
    }

    async onEndProposalClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.endProposalsRegistering({from: accounts[0]});  
            }
            catch(e) {
                this.logError('End Proposal', e);
            }
        }
    }

    async onStartVotingClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.startVotingSession({from: accounts[0]});  
            }
            catch(e) {
                this.logError('Start Voting', e);
            }
        }
    }

    async onEndVotingClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.endVotingSession({from: accounts[0]});  
            }
            catch(e) {
                this.logError('End Voting', e);
            }
        }
    }

    async onTallyClick() {

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const contract: Voting = getMetamaskSignedContract(window, this.contractAddress, VotingFactory.abi) as Voting;

            try {
                await contract.tallyVotes({from: accounts[0]});  
            }
            catch(e) {
                this.logError('Tally', e);
            }
        }
    }

    render() {

        return (
            <>
                <h2 className="admin-title">Admin</h2>

                <div className="admin-body">
                    <label className="admin-label">Add Voter :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Address" onChange={this.onAddVoterChange}/>
                    <button className="button button-text" onClick={this.onAddVoterClick}>Add</button><br />
                    <br />
                    <label className="admin-label">Start Proposals :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.onStartProposalClick}>Start</button><br />
                    <br />
                    <label className="admin-label">End Proposals :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.onEndProposalClick}>End</button><br />
                    <br />
                    <label className="admin-label">Start Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.onStartVotingClick}>Start</button><br />
                    <br />
                    <label className="admin-label">End Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.onEndVotingClick}>End</button><br />
                    <br />
                    <label className="admin-label">Tally Votes :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.onTallyClick}>Tally</button>
                </div>
            </>
        );
    }
}

export default AdminComponent;