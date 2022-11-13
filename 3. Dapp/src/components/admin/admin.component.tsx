import { Component } from 'react';
import LogLevel from '../../enumerations/logLevel';
import ILog from '../../interfaces/iLog';
import './admin.component.css';

class AdminComponent extends Component<{onAddLog: Function}> {

    constructor(props:any) {
        super(props);
        this.transfer = this.transfer.bind(this);
    }

    transfer() {
        this.props.onAddLog({level: LogLevel.success, date: new Date(), message:`Error - getBalance : `});
        /*
        if(!amoundSend) {
            return;
        }

        if (typeof window.ethereum != 'undefined') {
            const accounts = await getMetamaskAccounts(window);
            const signer = await getMetamaskSigner(window);

            try {
            const tx = {
                from: accounts[0],
                to: WalletAddress,
                value: ethers.utils.parseEther(amoundSend)
            }

            const transaction = await signer.sendTransaction(tx);
            await transaction.wait();
            setAmoundSend('');
            getBalance();
            addLog({level: LogLevel.success, message:`Success - transfer : ${amoundSend}eth`});
            }
            catch(e) {
            addLog({level: LogLevel.error, message:`Error - transfer : ${e}`});
            }
        }
        */
    }

    changeAmountSend(e:any) {
    
    //setAmoundSend(e.target.value);
    }

    render() {

        return (
            <>
                <h2 className="admin-title">Admin</h2>

                <div className="admin-body">
                    <label className="admin-label">Add Voter :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Address" onChange={this.changeAmountSend}/>
                    <button className="button button-text" onClick={this.transfer}>Add</button><br />
                    <br />
                    <label className="admin-label">Start Proposals :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.transfer}>Start</button><br />
                    <br />
                    <label className="admin-label">End Proposals :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.transfer}>End</button><br />
                    <br />
                    <label className="admin-label">Start Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.transfer}>Start</button><br />
                    <br />
                    <label className="admin-label">End Voting :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.transfer}>End</button><br />
                    <br />
                    <label className="admin-label">Tally Votes :</label>&nbsp;&nbsp;&nbsp;
                    <button className="button button-only " onClick={this.transfer}>Tally</button>
                </div>
            </>
        );
    }
}

export default AdminComponent;