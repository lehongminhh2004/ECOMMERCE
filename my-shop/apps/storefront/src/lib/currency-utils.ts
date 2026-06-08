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

    // When the user is on a Vietnamese locale but the channel only offers USD,
    // fall back to en-US formatting so we get "$372.00" instead of "372,00 US$"
    const effectiveLocale =
        locale === 'vi-VN' && currencyCode.toUpperCase() === 'USD' ? 'en-US' : locale;

    return new Intl.NumberFormat(effectiveLocale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(dividedValue);
}
