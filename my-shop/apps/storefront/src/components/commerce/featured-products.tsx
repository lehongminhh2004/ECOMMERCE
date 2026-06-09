import {ProductCarousel} from "@/components/commerce/product-carousel";
import {getRouteLocale} from "@/i18n/server";
import {cacheLife, cacheTag} from "next/cache";
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {query} from "@/lib/vendure/api";
import {SearchProductsQuery} from "@/lib/vendure/queries";
import { Link } from '@/i18n/navigation';
import {ArrowRight} from "lucide-react";
import {getTranslations} from 'next-intl/server';
import {getProductCardPriceOverrides} from '@/lib/vendure/product-card-price-overrides';

async function fetchFeaturedProducts(currencyCode: string, fetchOptions?: RequestInit) {
    const locale = await getRouteLocale();
    const result = await query(SearchProductsQuery, {
        input: {
            take: 12,
            skip: 0,
            groupByProduct: true
        }
    }, {languageCode: locale, currencyCode, fetch: fetchOptions});

    return result.data?.search?.items || [];
}

async function getFeaturedCollectionProducts(currencyCode: string) {
    'use cache'
    cacheLife('hours')

    const locale = await getRouteLocale();
    cacheTag(`featured-${locale}-${currencyCode}`);
    cacheTag('products');

    return fetchFeaturedProducts(currencyCode);
}


export async function FeaturedProducts() {
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode(locale);
    const t = await getTranslations({locale, namespace: 'Product'});
    let products = await getFeaturedCollectionProducts(currencyCode);

    if (products.length === 0) {
        products = await fetchFeaturedProducts(currencyCode, {cache: 'no-store'});
    }

    if (products.length === 0) {
        return null;
    }

    const priceOverrides = await getProductCardPriceOverrides(products, currencyCode);

    return (
        <div>
            <ProductCarousel
                title={t('featuredProducts')}
                products={products}
                priceOverrides={priceOverrides}
            />
            <div className="container mx-auto px-4 -mt-6 mb-8">
                <div className="flex justify-center">
                    <Link
                        href="/search"
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                    >
                        {t('viewAllProducts')}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
