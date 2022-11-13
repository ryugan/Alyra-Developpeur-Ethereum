import { useState, useEffect, Component } from 'react';
import { ethers } from 'ethers';
import { Voting } from './typechain-types/contracts';
import { Voting__factory as VotingFactory} from './typechain-types/factories/contracts';
import { getMetamaskNetwork, getMetamaskAccounts, getMetamaskContract, getMetamaskSigner } from './helpers/contractHelper'
import './App.css';
import ILog from './interfaces/iLog';
import ConsoleComponent from './components/console/console.component';
import LogLevel from './enumerations/logLevel';
import AdminComponent from './components/admin/admin.component';

const WalletAddress = '0xAb880578723d58d0A7115b95751Eae7d39789850';

class App extends Component {

  state = {
    titleNetwork: '',
    consoleRows: [] as ILog[]
  }
/*
  const [titleNetwork, setTitleNetwork] = useState('');
  const [consoleRows, setConsoleRows] = useState([] as ILog[]);

  const [balance, setBalance] = useState('');
  const [amoundSend, setAmoundSend] = useState('');
  const [amoundWithdraw, setAmoundWithdraw] = useState();
*/
/*
  useEffect(() => {
    loadNetworkTitle();
    getBalance();
  });
*/
  constructor(props:any) {
    super(props);
    this.loadNetworkTitle();
  }

  addLog(log:ILog) {

    if (log == null) {
      return;
    }

    const rows: ILog[] = this.state.consoleRows;

    if (rows.length > 10) {
      rows.shift();
    }
    
    rows.push(log);
    this.setState({consoleRows: rows});
  }

  async loadNetworkTitle() {
    const network = await getMetamaskNetwork(window);

      if (network == null) {
        return;
      }

      let networkName = network.chainId === 1337 ? "hardhat" : network.name;
      this.state.titleNetwork = `${network.chainId} - ${networkName}`;
  }

  handleAddLog(log:ILog) {

    if (log == null) {
      return;
    }

    this.addLog(log);
  }
/*
  async function getBalance() {
    
    if (typeof window.ethereum != 'undefined') {
      const accounts = await getMetamaskAccounts(window);
      const contract: Voting = getMetamaskContract(window, WalletAddress, VotingFactory.abi) as Voting;
      try {
        let overrides = {
          from: accounts[0]
        };
        const balance:ethers.BigNumber = await contract.getBalance(overrides);
        setBalance(ethers.utils.formatEther(balance));
      }
      catch(e) {
        addLog({level: LogLevel.error, message:`Error - getBalance : ${e}`});
      }
    }
  }
*/
  

  render() {
    return (
      <div className="App">
        
          <div className="App-header">
            <div className="App-header-title">
              <h1 className="App-header-h1 ">Voting</h1>
              {this.state.titleNetwork && <label className="App-header-network">({this.state.titleNetwork})</label>}
            </div>
          </div>
  
        <div className="App-body">
          <div className="App-body-block admin">
              <AdminComponent onAddLog={this.handleAddLog.bind(this)}/>
          </div>
          <div className="App-body-block voter">
            <h2 className="App-body-block-title">Voter</h2>
          </div>
        </div>
        
        {this.state.consoleRows.length > 0 && <div className="App-footer">
          <ConsoleComponent logs={this.state.consoleRows} />
        </div>}

      </div>
    );
  }
}

export default App;
