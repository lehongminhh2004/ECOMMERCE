'use server';

import {setCurrencyCookie} from '@/lib/currency';
import {getDefaultCurrencyForLocale} from '@/lib/currency-utils';
import {getActiveChannelCached} from '@/lib/vendure/cached';
import {updateTag} from 'next/cache';

export async function switchLocaleCurrency(locale: string) {
    const channel = await getActiveChannelCached();
    const currencyCode = getDefaultCurrencyForLocale(locale);

    if ((channel.availableCurrencyCodes as string[]).includes(currencyCode)) {
        await setCurrencyCookie(currencyCode);
    }

    updateTag('products');
    updateTag('collection');
    updateTag('cart');
    updateTag('active-order');
}
