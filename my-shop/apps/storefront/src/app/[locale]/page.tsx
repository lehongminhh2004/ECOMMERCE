import type {Metadata} from "next";
import {Suspense} from "react";
import {getRouteLocale} from "@/i18n/server";
import {HeroSection} from "@/components/layout/hero-section";
import {FeaturedProducts} from "@/components/commerce/featured-products";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {BadgeCheck, Tag, Zap} from "lucide-react";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import { getPageBySlug } from "@/lib/payload/api";
import { RenderBlocks } from "@/components/shared/render-blocks";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const ogLocale = toOgLocale(locale);

    // Try to get page metadata from CMS
    const payloadPage = await getPageBySlug('home');
    if (payloadPage) {
        return {
            title: `${SITE_NAME} - ${payloadPage.title}`,
            alternates: {
                canonical: buildCanonicalUrl("/"),
            },
            openGraph: {
                title: `${SITE_NAME} - ${payloadPage.title}`,
                type: "website",
                locale: ogLocale,
                url: SITE_URL,
            },
        };
    }

    return {
        title: {
            absolute: `${SITE_NAME} - ${t('pageTitle')}`,
        },
        description: t('description'),
        alternates: {
            canonical: buildCanonicalUrl("/"),
        },
        openGraph: {
            title: `${SITE_NAME} - ${t('pageTitle')}`,
            description: t('ogDescription'),
            type: "website",
            locale: ogLocale,
            url: SITE_URL,
        },
    };
}

const featureKeys = [
    {icon: BadgeCheck, key: 'highQuality'},
    {icon: Tag, key: 'bestPrices'},
    {icon: Zap, key: 'fastDelivery'},
] as const;

async function StaticHomepage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <div className="min-h-screen">
            <HeroSection/>
            <Suspense>
                <FeaturedProducts/>
            </Suspense>

            <section className="py-16 md:py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12">
                        {t('whyShopWithUs')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {featureKeys.map((feature) => (
                            <div
                                key={feature.key}
                                className="group relative text-center space-y-4 rounded-xl border border-transparent bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                                    <feature.icon className="size-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">{t(`features.${feature.key}.title`)}</h3>
                                <p className="text-muted-foreground leading-relaxed">{t(`features.${feature.key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

async function HomepageContent() {
    // Try to load CMS homepage content
    const payloadPage = await getPageBySlug('home');
    if (payloadPage && payloadPage.layout) {
        return (
            <div className="min-h-screen container mx-auto px-4 pt-24 pb-8 md:pt-28">
                <RenderBlocks blocks={payloadPage.layout} />
            </div>
        );
    }

    return <StaticHomepage />;
}

function HomepageSkeleton() {
    return (
        <div className="min-h-screen container mx-auto px-4 py-8 space-y-8 animate-pulse">
            <div className="h-64 bg-muted rounded-3xl w-full" />
            <div className="h-10 bg-muted rounded w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4">
                        <div className="aspect-square bg-muted rounded-xl" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<HomepageSkeleton />}>
            <HomepageContent />
        </Suspense>
    );
}
