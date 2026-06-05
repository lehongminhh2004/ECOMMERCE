import {getCurrencyCookie} from './currency';
import {getRouteLocale} from '@/i18n/server';
import {getDefaultCurrencyForLocale} from './currency-utils';
import {getActiveChannelCached} from './vendure/cached';

/**
 * Get the active currency code for the current request.
 * Uses the route locale as the source of truth, then falls back to cookie
 * and channel default when the locale currency is not available.
 *
 * Safe inside 'use cache: private' (cookies are part of the per-user cache key).
 * NOT safe inside public 'use cache' — pass currency as a parameter instead.
 */
export async function getActiveCurrencyCode(): Promise<string> {
    const channel = await getActiveChannelCached();
    const locale = await getRouteLocale();
    const localeCurrency = getDefaultCurrencyForLocale(locale);

    if (Array.isArray(channel.availableCurrencyCodes) && channel.availableCurrencyCodes.includes(localeCurrency as any)) {
        return localeCurrency;
    }

    const cookieValue = await getCurrencyCookie();
    if (cookieValue && Array.isArray(channel.availableCurrencyCodes) && channel.availableCurrencyCodes.includes(cookieValue as any)) {
        return cookieValue;
    }

    return channel.defaultCurrencyCode || 'VND';
}
