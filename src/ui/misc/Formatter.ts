import numeral from 'numeral';

export function formatNum(value: number, symbol = '$') {
  const formatted = numeral(value).format('0,0.00');
  return `${symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
}

export function formatAddress(value: string, topLength = 10, tailLength = 8) {
  return value.startsWith('0x')
    ? `${value.substring(0, topLength)}......${value.substring(value.length - tailLength)}`
    : value;
}
