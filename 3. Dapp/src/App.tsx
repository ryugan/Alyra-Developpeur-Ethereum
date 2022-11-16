import { Component } from 'react';
import { getMetamaskAccounts, getMetamaskNetwork, getMetamaskSignedContract } from './helpers/contractHelper'
import './App.css';
import ILog from './interfaces/iLog';
import ConsoleComponent from './components/console/console.component';
import AdminComponent from './components/admin/admin.component';
import VoterComponent from './components/voter/voter.component';
import LogLevel from './enumerations/logLevel';
import { Voting } from './typechain-types/contracts/Voting';
import { Voting__factory as VotingFactory} from './typechain-types/factories/contracts';
import { ABI } from './types/ABI';
import { Address } from './types/Address';
import WorkflowStatus from './enumerations/workflowStatus';

class App extends Component {

  state = {
    contractAddress: '' as Address,
    contractABI: '' as ABI,
    currentWallet: '' as Address,
    currentNetwork: '',
    isAdmin: false,
    isVoter: false,
    currentWorkflowStatus: WorkflowStatus.Unknown,
    consoleRows: [] as ILog[]
  }

  constructor(props:any) {
    super(props);

    this.handleAddVoter = this.handleAddVoter.bind(this);
    this.handleAddLog = this.handleAddLog.bind(this);
  }

  componentDidMount () {
    if (typeof window.ethereum === 'undefined') {
      this.logError('App', 'No wallet detected');
      return;
    }

    this.state.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';

    if (this.state.contractAddress === '') {
        this.logError('App', 'Contract address is empty');
        return;
    }

    this.state.contractABI = VotingFactory.abi;

    if (this.state.contractABI == null) {
        this.logError('App', 'Contract ABI is empty');
        return;
    }

    this.init();
  }

  async init() {
    await this.initNetworkTitle();
    await this.initWallet();
    await this.initContractValues();
  }

  async initNetworkTitle() {
    const network = await getMetamaskNetwork(window);

    if (network == null) {
      this.logError('App', 'Network is unknown');
      return;
    }

    let networkName = network.chainId === 1337 ? "hardhat" : network.name;
    this.setState({currentNetwork: `${network.chainId} - ${networkName}`});
  }

  async initWallet() {
    const accounts: string[] = await getMetamaskAccounts(window);

    if (!accounts.length) {
      this.logError('App', 'No wallet connected');
      return;
    }

    this.setState({currentWallet: accounts[0]});
  }

  async initContractValues() {

    const contract: Voting = getMetamaskSignedContract(window, this.state.contractAddress, this.state.contractABI) as Voting;

    const workflowStatus: number = await contract.workflowStatus({from: this.state.currentWallet});
    this.setState({currentWorkflowStatus: workflowStatus});

    const isOwner: boolean = await contract.isOwner({from: this.state.currentWallet});
    this.setState({isAdmin:  isOwner});

    const isVoter: boolean = await contract.isVoter({from: this.state.currentWallet});
    this.setState({isVoter: isVoter});
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

    this.addLog({level: LogLevel.error, date: new Date(), message:`Error - ${origine} : ${errorMessage}`});
}

  addLog(log:ILog) {

    if (log == null) {
      return;
    }

    const rows: ILog[] = this.state.consoleRows;
    const count: number = rows.length;

    if (count > 0) {

      if (log.level === LogLevel.success) {
        const lastLog: ILog = this.state.consoleRows[count-1];
        const diff = log.date.getTime() - lastLog.date.getTime();
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);

        if (diffMins < 3 && log.message === lastLog.message) {
          return;
        }
      }
      
      if (count > 1) {

        const lastLastLog: ILog = this.state.consoleRows[count-2];
        const diff = log.date.getTime() - lastLastLog.date.getTime();
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);

        if (diffMins < 3 && log.message === lastLastLog.message) {
          return;
        }

        if (count > 10) {
          rows.shift();
        }
      }
    }

    rows.push(log);
    this.setState({consoleRows: rows});
  }

  handleAddLog(log:ILog) {

    if (log == null) {
      return;
    }

    this.addLog(log);
  }
  
  async handleAddVoter() {

    if (typeof window.ethereum != 'undefined') {
      const contract: Voting = getMetamaskSignedContract(window, this.state.contractAddress, this.state.contractABI) as Voting;
      const isVoter: boolean = await contract.isVoter({from: this.state.currentWallet});

      this.setState({isVoter: isVoter});
    }
  }

  render() {
    return (
      <div className="App">
          {this.state.currentWallet && <label className="App-current-wallet">{this.state.currentWallet}</label>}
          <div className="App-header">
            <div className="App-header-title">
              <h1 className="App-header-h1 ">Voting</h1>
              {this.state.currentNetwork && <label className="App-header-network">({this.state.currentNetwork})</label>}
            </div>
          </div>
  
        <div className="App-body">
          {this.state.isAdmin && <div className="App-body-block admin-block">
              <AdminComponent contractAddress={this.state.contractAddress} contractABI={this.state.contractABI}
                currentWallet={this.state.currentWallet} currentWorkflowStatus={this.state.currentWorkflowStatus} 
                onAddLog={this.handleAddLog} onAddVoter={this.handleAddVoter} />
          </div>}
          {this.state.isVoter && <div className="App-body-block voter-block">
              <VoterComponent contractAddress={this.state.contractAddress} contractABI={this.state.contractABI}
                currentWallet={this.state.currentWallet} currentWorkflowStatus={this.state.currentWorkflowStatus} 
                onAddLog={this.handleAddLog} />
          </div>}
        </div>
        
        {this.state.consoleRows.length > 0 && <div className="App-footer">
          <ConsoleComponent logs={this.state.consoleRows} />
        </div>}

      </div>
    );
  }
}

export default App;
