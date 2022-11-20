import { Component } from 'react';
import { getMetamaskAccounts, getMetamaskNetwork, getMetamaskSignedContract } from './helpers/contractHelper'
import ILog from './models/ILog';
import ConsoleComponent from './components/console/console.component';
import AdminComponent from './components/admin/admin.component';
import VoterComponent from './components/voter/voter.component';
import LogLevel from './enumerations/logLevel';
import { Voting } from './typechain-types/contracts/Voting';
import { Voting__factory as VotingFactory} from './typechain-types/factories/contracts';
import { Address } from './types/Address';
import WorkflowStatus from './enumerations/workflowStatus';
import IProposal from './models/IProposal';
import ProposalsComponent from './components/proposals/proposals.component';
import Grid from "@material-ui/core/Grid";
import './App.css';

interface IAppState {
    contract: Voting | null,
    currentWallet: Address,
    currentNetwork: string,
    isAdmin: boolean,
    isVoter: boolean,
    currentWorkflowStatus: WorkflowStatus,
    proposals: IProposal[],
    consoleRows: ILog[],
}

class App extends Component {

  state: IAppState = {
    contract: null,
    currentWallet: '',
    currentNetwork: '',
    isAdmin: false,
    isVoter: false,
    currentWorkflowStatus: WorkflowStatus.Unknown,
    proposals: [],
    consoleRows: []
  }

  constructor(props:any) {
    super(props);

    this.initRoles = this.initRoles.bind(this);
    this.addProposal = this.addProposal.bind(this);
    this.voteProposal = this.voteProposal.bind(this);

    this.handleOwnershipTransferred = this.handleOwnershipTransferred.bind(this);
    this.handleWorkflowStatusChange = this.handleWorkflowStatusChange.bind(this);
    this.handleAddVoter = this.handleAddVoter.bind(this);
    this.handleAddLog = this.handleAddLog.bind(this);
  }

  componentDidMount () {

    if (typeof window.ethereum === 'undefined') {
      this.logError('App', 'No wallet detected');
      return;
    }

    this.addEmitsListener();
    this.init();
  }

  addEmitsListener() {
    window.ethereum.on('accountsChanged', async (accounts: Address[]) => {
      this.addLog({level: LogLevel.unknown, date: new Date(), message:`Account change - from ${this.state.currentWallet} to ${accounts[0]}`});

      this.state.contract = null;
      this.state.currentWallet = '';
      await this.init();
    });
  }

  async init() {
    await this.initNetworkTitle();
    await this.initWallet();
    await this.initContractValues();
    await this.initRoles();
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

    if (process.env.REACT_APP_CONTRACT_ADDRESS === '') {
        this.logError('App', 'Contract address is empty');
        return;
    }

    if (VotingFactory.abi == null) {
        this.logError('App', 'Contract ABI is empty');
        return;
    }
 
    const contract: Voting = getMetamaskSignedContract(window, process.env.REACT_APP_CONTRACT_ADDRESS ?? '', VotingFactory.abi) as Voting;
    this.setState({contract: contract});

    const workflowStatus: number = await contract.workflowStatus({from: this.state.currentWallet});
    this.setState({currentWorkflowStatus: workflowStatus});
  }

  async initRoles() {

    if (typeof window.ethereum != 'undefined' && this.state.contract) {
      const isOwner: boolean = await this.state.contract.isOwner({from: this.state.currentWallet});
      this.setState({isAdmin:  isOwner});

      const isVoter: boolean = await this.state.contract.isVoter({from: this.state.currentWallet});
      this.setState({isVoter: isVoter});
    }
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

    if (typeof window.ethereum != 'undefined' && this.state.contract) {
      const isVoter: boolean = await this.state.contract.isVoter({from: this.state.currentWallet});
      this.setState({isVoter: isVoter});
    }
  }

  handleWorkflowStatusChange(currentStatus: WorkflowStatus) {
    this.setState({currentWorkflowStatus: currentStatus});
  }

  async handleOwnershipTransferred() {

    if (typeof window.ethereum != 'undefined' && this.state.contract) {
      const isOwner: boolean = await this.state.contract.isOwner({from: this.state.currentWallet});
      this.setState({isAdmin:  isOwner});
    }
  }

  addProposal(proposal : IProposal | null): void {

    if (proposal == null) {
        return;
    }

    const proposals: IProposal[] = this.state.proposals;//[...this.state.proposals];
    const index = proposals.map(function(x) {return x.id; }).indexOf(proposal.id);

    if (index < 0) {
      proposals.push(proposal);
    }
    else {
      proposals[index].description = proposal.description;
      proposals[index].vote = proposal.vote;
    }

    this.setState({proposals:  proposals});
  }

  voteProposal(proposalId : number): void {
    if (proposalId > 0 && proposalId < this.state.proposals.length) {
        return;
    }
    
    const proposals = this.state.proposals;
    proposals[proposalId].vote++;
    this.setState({proposals:  proposals});
  }

  render() {

    const isAdminVisible: boolean = this.state.isAdmin;
    const isProposalsVisible: boolean = this.state.isVoter && this.state.proposals.length > 0;
    const isVoterVisible: boolean = this.state.isVoter;

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
          <Grid container>
            <Grid item sm={12} md={6} lg={4}>
              {isAdminVisible && <div className="App-body-block admin-block">
                <AdminComponent isAdmin={this.state.isAdmin} contract={this.state.contract as Voting}
                  currentWallet={this.state.currentWallet} currentWorkflowStatus={this.state.currentWorkflowStatus} 
                  onOwnershipTransferred={this.handleOwnershipTransferred} onWorkflowStatusChange={this.handleWorkflowStatusChange} 
                  onAddLog={this.handleAddLog} onAddVoter={this.handleAddVoter} />
            </div>}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {isProposalsVisible && <div className="App-body-block proposals-block">
                <ProposalsComponent proposals={this.state.proposals} />
            </div>}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {isVoterVisible && <div className="App-body-block voter-block">
                <VoterComponent isVoter={this.state.isVoter} contract={this.state.contract as Voting}
                  currentWallet={this.state.currentWallet} currentWorkflowStatus={this.state.currentWorkflowStatus} 
                  onAddLog={this.handleAddLog} 
                  onAddProposal={this.addProposal} onVoteProposal={this.voteProposal}/>
            </div>}
            </Grid>
          </Grid>
        </div>
        
        {this.state.consoleRows.length > 0 && <div className="App-footer">
          <ConsoleComponent logs={this.state.consoleRows} />
        </div>}

      </div>
    );
  }
}

export default App;
