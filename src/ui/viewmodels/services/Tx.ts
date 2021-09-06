import Messages, { ConfirmSendTx } from '../../../common/Messages';

import { Gwei_1 } from '../../../gas/Gasnow';
import ipc from '../../bridges/IPC';
import { providers } from 'ethers';

export async function sendTx({
  chainId,
  provider,
  data,
  from,
  to,
  gas,
  value,
}: {
  chainId: number;
  provider: providers.JsonRpcProvider | providers.WebSocketProvider;
  data: string;
  from: string;
  to: string;
  gas: number;
  value?: string;
}) {
  const [feeData, nonce] = await Promise.all([provider.getFeeData(), provider.getTransactionCount(this.account, 'pending')]);

  await ipc.invokeSecure<void>(Messages.createTransferTx, {
    from,
    to,
    value: value ?? '0',
    gas,
    maxFeePerGas: feeData.maxFeePerGas?.toNumber(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toNumber() + 2 * Gwei_1,
    gasPrice: feeData.gasPrice?.toNumber(),
    nonce,
    data,
    chainId,
  } as ConfirmSendTx);

  return { nonce };
}
