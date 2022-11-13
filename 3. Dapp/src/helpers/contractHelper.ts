import { ethers, Contract } from 'ethers';

import { ABI } from '../types/ABI';
import { Address } from '../types/Address';

/**
 * Get Metamask provider
*/
function getMetamaskProvider(windows: {ethereum:any}) {
    return new ethers.providers.Web3Provider(windows.ethereum);
}

/**
 * Get Metamask ChainId
*/
async function getMetamaskNetwork(windows: {ethereum:any}) : Promise<ethers.providers.Network> {
    const provider = getMetamaskProvider(windows);
    return await provider.getNetwork();
}

/**
 * Get Metamask accounts
*/
async function getMetamaskAccounts(windows: {ethereum:any}): Promise<string[]> {
    return await windows.ethereum.request({method:'eth_requestAccounts'})
}

/**
 * Get Metamask contract
*/
function getMetamaskContract(windows: {ethereum:any}, address: Address, abi: ABI) : Contract {
    const provider = getMetamaskProvider(windows);
    return new ethers.Contract(address, abi, provider);
}

/**
 * Get Metamask signed contract
*/
function getMetamaskSignedContract(windows: {ethereum:any}, address: Address, abi: ABI) : Contract {
    const signer = getMetamaskSigner(windows);
    return new ethers.Contract(address, abi, signer);
}

/**
 * Get Metamask ChainId
*/
function getMetamaskSigner(windows: {ethereum:any}) : ethers.providers.JsonRpcSigner {
    const provider = getMetamaskProvider(windows);
    return provider.getSigner();
}

export { getMetamaskProvider, getMetamaskNetwork, getMetamaskAccounts, getMetamaskContract, getMetamaskSignedContract, getMetamaskSigner };