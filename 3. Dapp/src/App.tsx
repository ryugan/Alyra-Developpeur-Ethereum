import { Component } from 'react';
import { getMetamaskNetwork } from './helpers/contractHelper'
import './App.css';
import ILog from './interfaces/iLog';
import ConsoleComponent from './components/console/console.component';
import AdminComponent from './components/admin/admin.component';
import VoterComponent from './components/voter/voter.component';
import LogLevel from './enumerations/logLevel';

const WalletAddress = '0xAb880578723d58d0A7115b95751Eae7d39789850';

class App extends Component {

  state = {
    titleNetwork: '',
    consoleRows: [] as ILog[]
  }

  constructor(props:any) {
    super(props);
    this.handleAddLog = this.handleAddLog.bind(this);
    this.loadNetworkTitle();
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
              <AdminComponent onAddLog={this.handleAddLog}/>
          </div>
          <div className="App-body-block voter-block">
            <VoterComponent onAddLog={this.handleAddLog}/>
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
