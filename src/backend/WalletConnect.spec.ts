import ERC20ABI from '../abis/ERC20.json';
import { ethers } from 'ethers';
import provider from '../common/Provider';

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
