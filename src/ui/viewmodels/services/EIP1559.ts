interface EIP1559Fees {
  baseFee: number;
  maxFeePerGas: number;
  priorityFeePerGas: number;
  suggestedPriorityFee: number;
}

export function calcSpeed({ baseFee, maxFeePerGas, priorityFeePerGas, suggestedPriorityFee }: EIP1559Fees) {
  if (maxFeePerGas < baseFee + priorityFeePerGas) {
    return 'slow';
  }

  const diff = priorityFeePerGas / suggestedPriorityFee;

  if (diff >= 1.5) {
    return 'rapid';
  } else if (diff >= 0.96) {
    return 'fast';
  } else if (diff >= 0.5) {
    return 'normal';
  }

  return 'slow';
}
