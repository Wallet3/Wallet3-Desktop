import numeral from 'numeral';

export function formatNum(value: number, symbol = '$') {
  return `${symbol} ${numeral(value).format('0,0.00')}`;
}
