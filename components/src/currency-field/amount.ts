/**
 * Money amounts as decimal strings (`-1234.50`), never floats, so nothing is rounded by binary
 * floating point. Reading uses the locale's digits and separators; formatting hands the string to
 * `Intl.NumberFormat`, which formats decimal strings exactly.
 */

/** A plain decimal string: optional minus, digits, optional fraction. */
const PLAIN_DECIMAL = /^-?\d+(\.\d+)?$/;

/** How a currency is shown in a locale. */
export interface CurrencyInfo {
  /** Whether `Intl` knows the currency code. */
  known: boolean;
  /** Digits after the decimal separator: JPY 0, USD 2, KWD 3. */
  digits: number;
  /** The symbol the locale uses, such as `€` or `US$`. */
  symbol: string;
  /** Whether the locale puts the symbol before or after the number. */
  placement: 'start' | 'end';
}

/** What typed text is, read as an amount. */
export type ParsedAmount =
  | { status: 'empty' }
  | { status: 'invalid' }
  /** Has more decimals than the currency allows. */
  | { status: 'decimals' }
  | { status: 'ok'; value: string };

/** `Intl.NumberFormat#format` takes decimal strings (Intl.NumberFormat v3); the DOM lib lags. */
type DecimalFormat = (value: string) => string;
type DecimalFormatToParts = (value: string) => Intl.NumberFormatPart[];

function formatDecimal(formatter: Intl.NumberFormat, value: string): string {
  return (formatter.format as unknown as DecimalFormat)(value);
}

function formatDecimalToParts(
  formatter: Intl.NumberFormat,
  value: string,
): Intl.NumberFormatPart[] {
  return (formatter.formatToParts as unknown as DecimalFormatToParts)(value);
}

function currencyFormatter(
  locale: string,
  currency: string,
  display: 'symbol' | 'narrowSymbol' | 'code' = 'symbol',
): Intl.NumberFormat | undefined {
  if (!/^[A-Za-z]{3}$/.test(currency)) return undefined;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: display,
    });
  } catch {
    return undefined;
  }
}

/** The digits, symbol and symbol placement of `currency` in `locale`. */
export function currencyInfo(locale: string, currency: string): CurrencyInfo {
  const formatter = currencyFormatter(locale, currency);
  if (!formatter) {
    return { known: false, digits: 2, symbol: '', placement: 'start' };
  }
  const parts = formatter.formatToParts(1);
  const symbolIndex = parts.findIndex(part => part.type === 'currency');
  const numberIndex = parts.findIndex(part => part.type === 'integer');
  return {
    known: true,
    digits: formatter.resolvedOptions().maximumFractionDigits ?? 2,
    symbol: parts[symbolIndex]?.value ?? currency,
    placement: symbolIndex > numberIndex ? 'end' : 'start',
  };
}

/** The currency's name in `locale` (`Euro`), or the code where Intl cannot name it. */
export function currencyName(locale: string, currency: string): string {
  try {
    return (
      new Intl.DisplayNames(locale, { type: 'currency' }).of(currency) ??
      currency
    );
  } catch {
    return currency;
  }
}

/** Trims or pads the fraction of a plain decimal to `digits`; `undefined` when it has more. */
export function normalizeAmount(
  value: string,
  digits: number,
): string | undefined {
  if (!PLAIN_DECIMAL.test(value)) return undefined;
  const negative = value.startsWith('-');
  const [integer, fraction = ''] = value.replace('-', '').split('.');
  const trimmed = fraction.length > digits ? fraction.replace(/0+$/, '') : '';
  if (trimmed.length > digits) return undefined;
  const padded = (fraction.length > digits ? trimmed : fraction).padEnd(
    digits,
    '0',
  );
  const whole = integer.replace(/^0+(?=\d)/, '');
  const zero = /^0*$/.test(whole + padded);
  const sign = negative && !zero ? '-' : '';
  return `${sign}${whole}${digits ? `.${padded}` : ''}`;
}

/** Compares two plain decimal strings exactly: negative, zero or positive like `a - b`. */
export function compareAmounts(a: string, b: string): number {
  const negativeA = a.startsWith('-');
  const negativeB = b.startsWith('-');
  if (negativeA !== negativeB) return negativeA ? -1 : 1;
  const [intA, fracA = ''] = a.replace('-', '').split('.');
  const [intB, fracB = ''] = b.replace('-', '').split('.');
  const wholeA = intA.replace(/^0+(?=\d)/, '');
  const wholeB = intB.replace(/^0+(?=\d)/, '');
  const length = Math.max(fracA.length, fracB.length);
  let result = wholeA.length - wholeB.length;
  if (result === 0) {
    const left = wholeA + fracA.padEnd(length, '0');
    const right = wholeB + fracB.padEnd(length, '0');
    if (left !== right) result = left < right ? -1 : 1;
  }
  return negativeA ? -result : result;
}

/** Whether `value` is a plain decimal string such as `-12.5`. */
export function isPlainDecimal(value: string): boolean {
  return PLAIN_DECIMAL.test(value);
}

/** The locale's decimal and group separators and its digits, for reading typed text. */
function localeNumberSymbols(locale: string) {
  let parts: Intl.NumberFormatPart[] = [];
  let digits = '0123456789';
  try {
    parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    // `9876543210` in the locale's own digits, so `٩` reads as 9.
    digits = [
      ...new Intl.NumberFormat(locale, { useGrouping: false }).format(
        9876543210,
      ),
    ]
      .reverse()
      .join('');
  } catch {
    // An invalid locale: read Latin digits with `.` and `,`.
  }
  return {
    decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
    group: parts.find(part => part.type === 'group')?.value ?? ',',
    digits: [...digits],
  };
}

/** Whether the integer part's groups look like grouping: later groups of 2 or 3, the last of 3. */
function validGrouping(groups: string[]): boolean {
  if (groups.some(group => !/^\d+$/.test(group))) return false;
  if (groups.length === 1) return true;
  if (groups[0].length > 3) return false;
  const rest = groups.slice(1);
  return (
    rest.every(group => group.length === 2 || group.length === 3) &&
    rest[rest.length - 1].length === 3
  );
}

/**
 * Reads an amount typed or pasted in `locale`: the locale's digits and decimal separator, with or
 * without grouping, currency symbols and codes, a minus sign or accounting brackets. When `.` and
 * `,` both appear, the last one is the decimal separator, so `€1,234.50` reads in any locale. A
 * lone separator that is the locale's group separator must group digits by three (`1,234`); one
 * that is neither the locale's decimal nor group separator is a decimal point (`12.50` in French).
 */
export function parseAmount(
  text: string,
  locale: string,
  currency: string,
  digits: number,
): ParsedAmount {
  const symbols = localeNumberSymbols(locale);
  let rest = text;
  // Currency symbols and codes, in every display the locale has.
  const marks = new Set<string>([currency.toUpperCase()]);
  for (const display of ['symbol', 'narrowSymbol', 'code'] as const) {
    const part = currencyFormatter(locale, currency, display)
      ?.formatToParts(1)
      .find(item => item.type === 'currency');
    if (part) marks.add(part.value);
  }
  for (const mark of [...marks].sort((a, b) => b.length - a.length)) {
    rest = rest.split(mark).join('');
  }
  rest = rest
    .replace(/\p{Sc}/gu, '')
    .replace(/[\s'’]/g, '')
    .replace(/\p{Nd}/gu, char => {
      const index = symbols.digits.indexOf(char);
      return index >= 0 ? String(index) : char;
    });
  if (!rest) return { status: 'empty' };

  let negative = false;
  const brackets = /^\((.*)\)$/.exec(rest);
  if (brackets) {
    negative = true;
    [, rest] = brackets;
  } else if (/^[-−]/.test(rest)) {
    negative = true;
    rest = rest.slice(1);
  } else if (/[-−]$/.test(rest)) {
    negative = true;
    rest = rest.slice(0, -1);
  }

  // Separators other than `.` and `,` (such as Arabic `٫` and `٬`) become `D` and nothing.
  if (symbols.decimal !== '.' && symbols.decimal !== ',') {
    rest = rest.split(symbols.decimal).join('D');
  }
  if (symbols.group !== '.' && symbols.group !== ',') {
    rest = rest.split(symbols.group).join('');
  }
  if (!/^[\d.,D]+$/.test(rest)) return { status: 'invalid' };

  let decimalMark = '';
  let groupMark = '';
  const hasDot = rest.includes('.');
  const hasComma = rest.includes(',');
  if (rest.includes('D')) {
    decimalMark = 'D';
    groupMark = hasDot ? '.' : ',';
  } else if (hasDot && hasComma) {
    decimalMark = rest.lastIndexOf('.') > rest.lastIndexOf(',') ? '.' : ',';
    groupMark = decimalMark === '.' ? ',' : '.';
  } else if (hasDot || hasComma) {
    const mark = hasDot ? '.' : ',';
    const count = rest.split(mark).length - 1;
    if (mark === symbols.decimal || (mark !== symbols.group && count === 1)) {
      decimalMark = mark;
    } else {
      groupMark = mark;
    }
  }

  const pieces = decimalMark ? rest.split(decimalMark) : [rest];
  if (pieces.length > 2) return { status: 'invalid' };
  const [integerText, fraction = ''] = pieces;
  if (/[^\d]/.test(fraction)) return { status: 'invalid' };
  const groups = groupMark ? integerText.split(groupMark) : [integerText];
  if (groupMark && !validGrouping(groups)) return { status: 'invalid' };
  const integer = groups.join('');
  if (!/^\d*$/.test(integer) || (!integer && !fraction)) {
    return { status: 'invalid' };
  }

  const plain = `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
  const value = normalizeAmount(plain, digits);
  return value === undefined ? { status: 'decimals' } : { status: 'ok', value };
}

/** The amount as the locale writes it with grouping, without the currency symbol. */
export function formatAmount(
  value: string,
  locale: string,
  currency: string,
  digits: number,
): string {
  const formatter =
    currencyFormatter(locale, currency) ??
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  const parts = formatDecimalToParts(formatter, value);
  const index = parts.findIndex(part => part.type === 'currency');
  if (index < 0) return parts.map(part => part.value).join('');
  // Drop the symbol and the space that joins it to the number.
  const isSpace = (part?: Intl.NumberFormatPart) =>
    part?.type === 'literal' && /^\s+$/.test(part.value);
  const skip = new Set([index]);
  if (isSpace(parts[index - 1])) skip.add(index - 1);
  if (isSpace(parts[index + 1])) skip.add(index + 1);
  return parts
    .filter((_, position) => !skip.has(position))
    .map(part => part.value)
    .join('')
    .trim();
}

/** The amount as the person edits it: the locale's digits and decimal separator, no grouping. */
export function editableAmount(
  value: string,
  locale: string,
  digits: number,
): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      useGrouping: false,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return formatDecimal(formatter, value);
  } catch {
    return value;
  }
}

/** The amount with its currency, for messages such as "Enter €10.00 or more". */
export function formatWithCurrency(
  value: string,
  locale: string,
  currency: string,
): string {
  const formatter = currencyFormatter(locale, currency);
  return formatter ? formatDecimal(formatter, value) : value;
}
