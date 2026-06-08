import {getCurrencyCookie} from './currency';
import {getRouteLocale} from '@/i18n/server';
import {getDefaultCurrencyForLocale} from './currency-utils';
import {getActiveChannelCached} from './vendure/cached';
import {getLocale} from 'next-intl/server';

/**
 * Get the active currency code for the current request.
 *
 * Priority:
 * 1. If the locale's preferred currency is available on the channel → use it
 * 2. If the user has a valid currency cookie → use it
 * 3. Fall back to the channel's default currency
 *
 * Safe inside 'use cache: private' (cookies are part of the per-user cache key).
 * NOT safe inside public 'use cache' — pass currency as a parameter instead.
 */
export async function getActiveCurrencyCode(localeOverride?: string): Promise<string> {
    const channel = await getActiveChannelCached();
    const available = Array.isArray(channel.availableCurrencyCodes)
        ? (channel.availableCurrencyCodes as string[])
        : [];

    let locale = localeOverride;
    if (!locale) {
        try {
            locale = await getRouteLocale();
        } catch {
            // Fallback for Server Actions where route params context is not available
            locale = await getLocale();
        }
    }

    // 1. Prefer locale-mapped currency if the channel supports it
    const localeCurrency = getDefaultCurrencyForLocale(locale);
    if (available.includes(localeCurrency)) {
        return localeCurrency;
    }

    // 2. Honor the user's cookie if it points to a valid currency
    const cookieValue = await getCurrencyCookie();
    if (cookieValue && available.includes(cookieValue)) {
        return cookieValue;
    }

    // 3. Channel default (always safe)
    return channel.defaultCurrencyCode || available[0] || 'USD';
}
