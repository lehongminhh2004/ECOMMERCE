import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'vi'],
    defaultLocale: 'en',
    // Always use locale prefix in URL (/en/... and /vi/...)
    // This ensures / redirects to /en and locale switching is unambiguous
    localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
};
