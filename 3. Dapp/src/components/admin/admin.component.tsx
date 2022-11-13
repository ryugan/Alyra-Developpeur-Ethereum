import { Component } from 'react';
import { ethers } from 'ethers';
import LogLevel from '../../enumerations/logLevel';
import { getMetamaskAccounts, getMetamaskSigner } from '../../helpers/contractHelper';
import './admin.component.css';

class AdminComponent extends Component<{onAddLog: Function}> {

    state = {
        newVoterAddress: ''
    }

    constructor(props:any) {
        super(props);
        this.onAddVoterChange = this.onAddVoterChange.bind(this);
        this.onAddVoterClick = this.onAddVoterClick.bind(this);
    }

    todo() {}

    async onAddVoterClick() {

        if (this.state.newVoterAddress == null || this.state.newVoterAddress === '') {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const signer = await getMetamaskSigner(window);

            try {
                const tx = {
                    from: accounts[0],
                    to: process.env.REACT_APP_CONTRACT_ADDRESS,
                    value: ethers.utils.parseEther(this.state.newVoterAddress)
                }

                const transaction = await signer.sendTransaction(tx);
                await transaction.wait();
                this.props.onAddLog({level: LogLevel.success, date: new Date(), message:`Success - Add Voter : ${this.state.newVoterAddress}`});
            }
            catch(e) {
                this.logError(e);
            }
        }
    }

    logError(error: any) {
        const maxLength: number = 50;
        let errorMessage: string = (error.reason as string) ?? '';

        if (errorMessage.length > 0) {

            errorMessage = errorMessage.replace('Error:', '');

            if (errorMessage.length > maxLength) {
                errorMessage = `${errorMessage.slice(0, maxLength)}...`;
            }
        }

        this.props.onAddLog({level: LogLevel.error, date: new Date(), message:`Error - Add Voter : ${errorMessage}`});
    }

    onAddVoterChange(e:any) {
        this.setState({newVoterAddress: e.target.value});
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
                    <button className="button button-only " onClick={this.todo}>Start</button><br />
                    <br />
                    <label className="admin-label">End Proposals :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.todo}>End</button><br />
                    <br />
                    <label className="admin-label">Start Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.todo}>Start</button><br />
                    <br />
                    <label className="admin-label">End Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.todo}>End</button><br />
                    <br />
                    <label className="admin-label">Tally Votes :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.todo}>Tally</button>
                </div>
            </>
        );
    }
}

export default AdminComponent;