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
                <label>Envoyer de l'ether :</label>&nbsp;&nbsp;&nbsp;
                <input className="input-text" type="text" onChange={this.changeAmountSend}/>
                <button className="button-text" onClick={this.transfer}>Valider</button>
            </>
        );
    }
}

export default AdminComponent;