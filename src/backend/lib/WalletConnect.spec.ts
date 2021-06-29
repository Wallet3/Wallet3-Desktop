import * as metamaskSign from 'eth-sig-util';

import ERC20ABI from '../../abis/ERC20.json';
import { ethers } from 'ethers';
import { getProviderByChainId } from '../../common/Provider';

const provider = getProviderByChainId(1);

test('decode function', () => {
  const data =
    '0xa9059cbb0000000000000000000000009a076ad97f565aa44692b609d4ebc91643a8743200000000000000000000000000000000000000000000000684ab28a160632d91';
  const iface = new ethers.utils.Interface(ERC20ABI);
  const { dst, wad } = iface.decodeFunctionData('transfer', data);
  expect(dst).toBe('0x9A076ad97f565AA44692b609d4EBc91643a87432');
  expect(wad.toString()).toBe('120240243749853277585');
});

test('contract call', async () => {
  const c = new ethers.Contract('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', ERC20ABI, provider);
  expect(await c.decimals()).toBe(18);
  expect(await c.symbol()).toBe('UNI');
});

test('getBalance', async () => {
  const balance = await provider.getBalance('0x3afd8a3ffD64712F523Af8788763EE0C718614A2');
  expect(balance.gte(0)).toBe(true);
});

test('decode approve', () => {
  const data =
    '0x095ea7b3000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

  const iface = new ethers.utils.Interface(ERC20ABI);
  const { guy, wad } = iface.decodeFunctionData('approve', data);
  expect(guy).toBe('0xE592427A0AEce92De3Edee1F18E0157C05861564');
  expect(wad.toString()).toBe('115792089237316195423570985008687907853269984665640564039457584007913129639935');
});

test('walletconnect_example_signTypedData', () => {
  const typedData = {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      Person: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'wallet',
          type: 'address',
        },
      ],
      Mail: [
        {
          name: 'from',
          type: 'Person',
        },
        {
          name: 'to',
          type: 'Person',
        },
        {
          name: 'contents',
          type: 'string',
        },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  const priv = Buffer.from('061346f919677a201278c8ff8ece751bdb455f2909b6e8be3b58e4d9534df40b', 'hex');
  const signed = metamaskSign.signTypedData_v4(priv, { data: typedData as any });
  // expect(signed).toBe('');
});

test('signTypedData', () => {
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'verifyingContract', type: 'address' },
      ],
      RelayRequest: [
        { name: 'target', type: 'address' },
        { name: 'encodedFunction', type: 'bytes' },
        { name: 'gasData', type: 'GasData' },
        { name: 'relayData', type: 'RelayData' },
      ],
      GasData: [
        { name: 'gasLimit', type: 'uint256' },
        { name: 'gasPrice', type: 'uint256' },
        { name: 'pctRelayFee', type: 'uint256' },
        { name: 'baseRelayFee', type: 'uint256' },
      ],
      RelayData: [
        { name: 'senderAddress', type: 'address' },
        { name: 'senderNonce', type: 'uint256' },
        { name: 'relayWorker', type: 'address' },
        { name: 'paymaster', type: 'address' },
      ],
    },
    domain: {
      name: 'GSN Relayed Transaction',
      version: '1',
      chainId: 42,
      verifyingContract: '0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B',
    },
    primaryType: 'RelayRequest',
    message: {
      target: '0x9cf40ef3d1622efe270fe6fe720585b4be4eeeff',
      encodedFunction:
        '0xa9059cbb0000000000000000000000002e0d94754b348d208d64d52d78bcd443afa9fa520000000000000000000000000000000000000000000000000000000000000007',
      gasData: { gasLimit: '39507', gasPrice: '1700000000', pctRelayFee: '70', baseRelayFee: '0' },
      relayData: {
        senderAddress: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
        senderNonce: '3',
        relayWorker: '0x3baee457ad824c94bd3953183d725847d023a2cf',
        paymaster: '0x957F270d45e9Ceca5c5af2b49f1b5dC1Abb0421c',
      },
    },
  };
});
