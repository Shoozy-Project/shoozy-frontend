export function formatMinorAmount(amountMinor: string, minorUnit: number) {
  const amount = BigInt(amountMinor);
  const negative = amount < BigInt(0);
  const digits = (negative ? -amount : amount).toString().padStart(minorUnit + 1, '0');
  const integer = minorUnit === 0 ? digits : digits.slice(0, -minorUnit);
  const fraction = minorUnit === 0 ? '' : `.${digits.slice(-minorUnit)}`;
  return `${negative ? '-' : ''}${integer}${fraction}`;
}

export function formatMinorMoney(amountMinor: string, currency: string, minorUnit = currency === 'TND' ? 3 : 2, locale = 'en-TN') {
  const amount = Number(formatMinorAmount(amountMinor, minorUnit));
  if (Number.isFinite(amount)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: minorUnit,
      maximumFractionDigits: minorUnit,
    }).format(amount);
  }
  return `${formatMinorAmount(amountMinor, minorUnit)} ${currency}`;
}

export function majorToMinorString(amount: string, minorUnit: number) {
  const match = amount.trim().match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return '0';
  const fraction = (match[2] ?? '').padEnd(minorUnit, '0').slice(0, minorUnit);
  return BigInt(`${match[1]}${fraction}`).toString();
}
