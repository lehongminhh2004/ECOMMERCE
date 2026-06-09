import {getRouteLocale} from '@/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/lib/vendure/cached';
import {MobileNav} from '@/components/layout/navbar/mobile-nav';
import {getNavigation} from '@/lib/payload/api';
import {localizeCollection} from '@/lib/vendure/localized-overrides';

export async function MobileNavWrapper() {
    "use cache";
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`mobile-nav-${locale}`);

    let navigation = null;
    try {
        navigation = await getNavigation();
    } catch {
        // Payload CMS unreachable — use empty CMS links
    }

    const [collections] = await Promise.all([
        getTopCollections(locale),
    ]);

    const localizedCollections = collections.map((collection) => localizeCollection(collection, locale));
    const cmsLinks = navigation?.links || [];

    return <MobileNav collections={localizedCollections} cmsLinks={cmsLinks} />;
}
