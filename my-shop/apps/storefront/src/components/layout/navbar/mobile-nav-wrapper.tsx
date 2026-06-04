import {getRouteLocale} from '@/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/lib/vendure/cached';
import {MobileNav} from '@/components/layout/navbar/mobile-nav';
import {getNavigation} from '@/lib/payload/api';

export async function MobileNavWrapper() {
    "use cache";
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`mobile-nav-${locale}`);

    const [collections, navigation] = await Promise.all([
        getTopCollections(locale),
        getNavigation(),
    ]);

    const cmsLinks = navigation?.links || [];

    return <MobileNav collections={collections} cmsLinks={cmsLinks} />;
}

