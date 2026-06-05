'use client';

import {useLocale} from 'next-intl';
import {toIntlLocale} from '@/i18n/locale-utils';
import {formatPrice} from '@/lib/currency-utils';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({value, currencyCode = 'USD'}: PriceProps) {
    const locale = useLocale();
    const intlLocale = toIntlLocale(locale);

    return (
        <span suppressHydrationWarning>
            {formatPrice(value, currencyCode, intlLocale)}
        </span>
    );
}

