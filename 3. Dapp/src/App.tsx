import { Component } from 'react';
import { getMetamaskNetwork } from './helpers/contractHelper'
import './App.css';
import ILog from './interfaces/iLog';
import ConsoleComponent from './components/console/console.component';
import AdminComponent from './components/admin/admin.component';
import VoterComponent from './components/voter/voter.component';

const WalletAddress = '0xAb880578723d58d0A7115b95751Eae7d39789850';

class App extends Component {

  state = {
    titleNetwork: '',
    consoleRows: [] as ILog[]
  }

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
          <div className="App-body-block admin-block">
              <AdminComponent onAddLog={this.handleAddLog.bind(this)}/>
          </div>
          <div className="App-body-block voter-block">
            <VoterComponent onAddLog={this.handleAddLog.bind(this)}/>
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
