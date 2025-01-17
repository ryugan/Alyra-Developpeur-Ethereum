import { Component } from 'react';
import LogLevel from '../../enumerations/logLevel';
import { Voting } from '../../typechain-types/contracts';
import WorkflowStatus from '../../enumerations/workflowStatus';
import { Address } from '../../types/Address';
import './admin.component.css';

interface AdminComponentProperties {
    isAdmin: boolean,
    contract: Voting | null
    currentWallet: Address,
    currentWorkflowStatus: WorkflowStatus,

    onOwnershipTransferred: Function,
    onAddLog: Function,
    onAddVoter: Function,
    onWorkflowStatusChange: Function,
}

class AdminComponent extends Component<AdminComponentProperties> {

    state = {
        changeAdmin: '',
        newVoterAddress: ''
    }

    constructor(props:any) {
        super(props);

        this.onChangeAdminChange = this.onChangeAdminChange.bind(this);
        this.onAddVoterChange = this.onAddVoterChange.bind(this);
        this.onAddVoterClick = this.onAddVoterClick.bind(this);
        this.onChangeAdminClick = this.onChangeAdminClick.bind(this);
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
        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            this.props.contract.on('OwnershipTransferred', (previousOwner:string, newOwner:string) => {
                this.logSuccess(`Success - emit OwnershipTransferred : transfert ownership from ${previousOwner} to ${newOwner} `);
                this.props.onOwnershipTransferred();
            });
            this.props.contract.on('VoterRegistered', (address:string) => {
                this.logSuccess(`Success - emit VoterRegistered : ${address}`); 
                this.props.onAddVoter();
            });
            this.props.contract.on('WorkflowStatusChange', (previousStatus: WorkflowStatus, newStatus: WorkflowStatus) => {
                this.logSuccess(`Success - emit WorkflowStatusChange : change from ${WorkflowStatus[previousStatus]} to ${WorkflowStatus[newStatus]}`);
                this.props.onWorkflowStatusChange(newStatus);
            });
        }
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

    onChangeAdminChange(e:any) {
        this.setState({changeAdmin: e.target.value});
    }

    onAddVoterChange(e:any) {
        this.setState({newVoterAddress: e.target.value});
    }

    async onChangeAdminClick() {

        if (this.state.changeAdmin == null || this.state.changeAdmin === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined' && this.props.contract) 
        {
            try {
                await this.props.contract.transferOwnership(this.state.changeAdmin, {from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('Add Voter', e);
            }
        }
    }

    async onAddVoterClick() {

        if (this.state.newVoterAddress == null || this.state.newVoterAddress === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            try {
                await this.props.contract.addVoter(this.state.newVoterAddress, {from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('Add Voter', e);
            }
        }
    }

    async onStartProposalClick() {

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
           try {
                await this.props.contract.startProposalsRegistering({from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('Start Proposal', e);
            }
        }
    }

    async onEndProposalClick() {

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            try {
                await this.props.contract.endProposalsRegistering({from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('End Proposal', e);
            }
        }
    }

    async onStartVotingClick() {

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            try {
                await this.props.contract.startVotingSession({from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('Start Voting', e);
            }
        }
    }

    async onEndVotingClick() {

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            try {
                await this.props.contract.endVotingSession({from: this.props.currentWallet});  
            }
            catch(e) {
                this.logError('End Voting', e);
            }
        }
    }

    async onTallyClick() {

        if (typeof window.ethereum != 'undefined' && this.props.contract) {
            try {
                await this.props.contract.tallyVotes({from: this.props.currentWallet});  
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
                    <label className="admin-label admin-label">Change admin:</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Address" onChange={this.onChangeAdminChange}/>
                    <button className="button button-text" onClick={this.onChangeAdminClick}>Change</button><br />
                    <br />
                    <hr></hr>
                    <br />
                    {this.props.currentWorkflowStatus === WorkflowStatus.RegisteringVoters && <>
                        <label className="admin-label">Add Voter :</label>&nbsp;&nbsp;&nbsp;
                        <input className="input-text" type="text" placeholder="Address" onChange={this.onAddVoterChange}/>
                        <button className="button button-text" onClick={this.onAddVoterClick}>Add</button><br />
                        <br />
                        <label className="admin-label">Start Proposals :</label>&nbsp;&nbsp;&nbsp;
                        <button className="button button-only " onClick={this.onStartProposalClick}>Start</button><br />
                    </>}
                    {this.props.currentWorkflowStatus === WorkflowStatus.ProposalsRegistrationStarted && <>
                        <br />
                        <label className="admin-label">End Proposals :</label>&nbsp;&nbsp;&nbsp;
                        <button className="button button-only " onClick={this.onEndProposalClick}>End</button><br />
                    </>}
                    {this.props.currentWorkflowStatus === WorkflowStatus.ProposalsRegistrationEnded && <>
                        <br />
                        <label className="admin-label">Start Voting :</label>&nbsp;&nbsp;&nbsp;
                        <button className="button button-only " onClick={this.onStartVotingClick}>Start</button><br />
                    </>}
                    {this.props.currentWorkflowStatus === WorkflowStatus.VotingSessionStarted && <>
                        <br />
                        <label className="admin-label">End Voting :</label>&nbsp;&nbsp;&nbsp;
                        <button className="button button-only " onClick={this.onEndVotingClick}>End</button><br />
                    </>}
                    {this.props.currentWorkflowStatus === WorkflowStatus.VotingSessionEnded && <>
                        <br />
                        <label className="admin-label">Tally Votes :</label>&nbsp;&nbsp;&nbsp;
                        <button className="button button-only " onClick={this.onTallyClick}>Tally</button>
                    </>}
                </div>
            </>
        );
    }
}

export default AdminComponent;