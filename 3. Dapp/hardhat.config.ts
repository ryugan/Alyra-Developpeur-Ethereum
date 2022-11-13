import { HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkAccountUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import { ethers } from 'ethers';
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env'});

const defaultEthBalance: string = ethers.utils.parseEther('1000').toString();
const defaultHardhatAccounts: HardhatNetworkAccountUserConfig[] = [
  {privateKey:'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', balance:defaultEthBalance},
  {privateKey:'0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', balance:defaultEthBalance},
  {privateKey:'0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', balance:defaultEthBalance},
  {privateKey:'0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', balance:defaultEthBalance},
  {privateKey:'0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', balance:defaultEthBalance},
];

const INFURA_KEY: string = process.env.INFURA_KEY ?? '';
const PRIVATE_KEY: string = process.env.PRIVATE_KEY ?? '';

if (PRIVATE_KEY!= undefined) {
  defaultHardhatAccounts.unshift({privateKey:`${process.env.PRIVATE_KEY}`, balance:defaultEthBalance});
}



const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: defaultHardhatAccounts
    },
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
  typechain: {
    outDir: 'src/typechain-types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['externalArtifacts/*.json'],
    dontOverrideCompile: false
  }
};

export default config;
