import numeral from 'numeral';

export function formatNum(value: number, symbol = '$') {
  const formatted = numeral(value || 0).format('0,0.00');
  return `${symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
}

export function formatAddress(value: string, headLength = 10, tailLength = 8) {
  return value?.length > headLength + tailLength
    ? `${value.substring(0, headLength)}......${value.substring(value.length - tailLength)}`
    : value;
}

export function formatValue(value: string | number) {
  return `${value}`.substring(0, `${value}`.indexOf('.') + 8);
}
