import { ethers } from 'ethers';
import { infuraId } from './.wallet3.rc.json';

const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraId}`);

export default provider;

// For bsc
// https://bscproject.org/#/rpcserver