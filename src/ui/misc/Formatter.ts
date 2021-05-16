import numeral from 'numeral';

export function formatNum(value: number, symbol = '$') {
  const formatted = numeral(value).format('0,0.00');
  return `${symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
}
