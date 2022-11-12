import { useState, useEffect, Fragment } from 'react';
import { ethers } from 'ethers';
import { Wallet, Wallet__factory as WalletFactory} from './typechain-types';
import { getMetamaskNetwork, getMetamaskAccounts, getMetamaskContract, getMetamaskSigner } from './helpers/contractHelper'
import './App.css';

const WalletAddress = '0xAb880578723d58d0A7115b95751Eae7d39789850';

enum LogLevel {
  unknown = 'unknown',
  normal = 'normal',
  success = 'success',
  error = 'error'
}

interface ILog {
  level: LogLevel;
  message: string;
}

function App() {

  const [titleNetwork, setTitleNetwork] = useState('');
  const [consoleRows, setConsoleRows] = useState([] as ILog[]);

  const [balance, setBalance] = useState('');
  const [amoundSend, setAmoundSend] = useState('');
  const [amoundWithdraw, setAmoundWithdraw] = useState();

  useEffect(() => {
    loadNetworkTitle();
    getBalance();
  });

  function addLog(log:ILog) {
    const logs:ILog[] = consoleRows;

    if (logs.length < 11) {
      logs.push(log);
    }
    else {
      logs.unshift(log);
      logs.pop();
    }

    setConsoleRows(logs);
  }

  async function loadNetworkTitle() {
    const network = await getMetamaskNetwork(window);

      if (network == null) {
        return;
      }

      let networkName = network.chainId === 1337 ? "hardhat" : network.name;
      
      setTitleNetwork(`${network.chainId} - ${networkName}`);
  }

  async function getBalance() {
    if (typeof window.ethereum != 'undefined') {
      const accounts = await getMetamaskAccounts(window);
      const contract: Wallet = getMetamaskContract(window, WalletAddress, WalletFactory.abi) as Wallet;
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

  async function transfer() {
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
  }

  function changeAmountSend(e:any) {
    setAmoundSend(e.target.value);
  }

  return (
    <div className="App">
      
        <div className="App-header">
          <div className="App-header-title">
            <h1 className="App-header-h1 ">Voting</h1>
            {titleNetwork && <label className="App-header-network">({titleNetwork})</label>}
          </div>
        </div>

      <div className="App-body">
        <div className="App-body-block admin">
          <h2 className="App-body-block-title">Admin</h2>
            {balance} eth<br /><br />
            <label>Envoyer de l'ether :</label>&nbsp;&nbsp;&nbsp;
            <input className="input-text" type="text" onChange={changeAmountSend}/>
            <button className="button-text" onClick={transfer}>Valider</button>
        </div>
        <div className="App-body-block voter">
          <h2 className="App-body-block-title">Voter</h2>
        </div>
      </div>
      
      <div className="App-footer">
        <h2 className="App-footer-title">{">_"}</h2>
        {consoleRows.length > 0 &&
          consoleRows.map((row, i) => 
          <Fragment>
            <label key={i} className={`console-log console-log-${row.level}`}>{row.message}</label><br/>
          </Fragment>
          )
        }
      </div>
    </div>
  );
}

export default App;
