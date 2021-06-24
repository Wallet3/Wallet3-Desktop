import { BigNumber, utils } from 'ethers';

import ERC20ABI from '../abis/ERC20.json';
import { ITransaction } from '../backend/models/Transaction';

const Methods = new Map([
  ['0xa9059cbb', 'Transfer Token'],
  ['0x095ea7b3', 'Approve'],
]);

const erc20 = new utils.Interface(ERC20ABI);

export function parseMethod(tx: ITransaction, args?: { owner?: string; nativeSymbol?: string }) {
  if (tx.data.length === 2) {
    if (tx.to === args?.owner) return { method: `Receive ${args?.nativeSymbol ?? 'Ether'}` };

    return { method: `Sent ${args?.nativeSymbol ?? 'Ether'}` };
  }

  const func = tx.data.substring(0, 10);
  const method = Methods.get(func) ?? 'Contract Interaction';
  let to: string = undefined;
  let amount: BigNumber;

  if (method === 'Transfer Token') {
    const { dst, wad } = erc20.decodeFunctionData('transfer', tx.data);
    to = dst;
    amount = wad;
  }

  if (method === 'Approve') {
    const { guy } = erc20.decodeFunctionData('approve', tx.data);
    to = guy;
  }

  return { method, to, amount };
}
