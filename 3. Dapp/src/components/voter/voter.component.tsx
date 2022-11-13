import { Component } from 'react';
import LogLevel from '../../enumerations/logLevel';
import ILog from '../../interfaces/iLog';
import './voter.component.css';

class VoterComponent extends Component<{onAddLog: Function}> {

    constructor(props:any) {
        super(props);
        this.transfer = this.transfer.bind(this);
    }

    transfer() {
        this.props.onAddLog({level: LogLevel.success, date: new Date(), message:`Error - getBalance : `});
    }

    changeAmountSend(e:any) {
    }

    render() {

        return (
            <>
                <h2 className="voter-title">Voter</h2>

                <div className="voter-body">
                    <label className="voter-label">Get Voter :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Address" onChange={this.changeAmountSend}/>
                    <button className="button button-text" onClick={this.transfer}>Get</button><br />
                    <br />
                    <label className="voter-label">Get One Proposal :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Id" onChange={this.changeAmountSend}/>
                    <button className="button button-text" onClick={this.transfer}>Get</button><br />
                    <br />
                    <label className="voter-label">Add Proposal :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Description" onChange={this.changeAmountSend}/>
                    <button className="button button-text" onClick={this.transfer}>Add</button><br />
                    <br />
                    <label className="voter-label">Set Vote :</label>&nbsp;&nbsp;&nbsp;
                    <input className="input-text" type="text" placeholder="Id" onChange={this.changeAmountSend}/>
                    <button className="button button-text" onClick={this.transfer}>Add</button>
                </div>
            </>
        );
    }
}

export default VoterComponent;