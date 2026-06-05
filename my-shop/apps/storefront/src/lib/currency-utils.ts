export function getCurrencyFractionDigits(currencyCode: string): number {
    const zeroDecimalCurrencies = ['VND', 'JPY', 'KRW', 'UGX', 'CLP', 'PYG', 'RWF', 'BIF', 'DJF', 'GNF', 'KMF', 'LAK', 'MGA', 'VUV', 'XAF', 'XOF', 'XPF'];
    if (zeroDecimalCurrencies.includes(currencyCode.toUpperCase())) {
        return 0;
    }
    return 2;
}

export function getDefaultCurrencyForLocale(locale: string): string {
    return locale === 'en' ? 'USD' : 'VND';
}

export function formatPrice(value: number, currencyCode: string, locale: string): string {
    const fractionDigits = getCurrencyFractionDigits(currencyCode);
    const dividedValue = value / Math.pow(10, fractionDigits);
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(dividedValue);
}
