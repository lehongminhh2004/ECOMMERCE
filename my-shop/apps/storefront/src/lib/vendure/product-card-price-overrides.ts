import {readFragment, type FragmentOf} from '@/graphql';
import {getRouteLocale} from '@/i18n/server';
import {ProductCardFragment} from './fragments';
import {query} from './api';
import {GetProductPriceBySlugQuery} from './queries';

export type ProductCardPrice =
    | { currencyCode: string; priceWithTax: { __typename: 'PriceRange'; min: number; max: number } }
    | { currencyCode: string; priceWithTax: { __typename: 'SinglePrice'; value: number } };

/**
 * Fetches price overrides for products whose cached currencyCode does not match
 * the active currency. Uses a lightweight query (variants.priceWithTax only)
 * instead of the full product detail — ~80% less data per request.
 *
 * In practice this should return {} most of the time because the search query
 * already passes currencyCode to Vendure. Overrides are only needed when a
 * stale cache entry has a mismatched currency.
 */
export async function getProductCardPriceOverrides(
    products: Array<FragmentOf<typeof ProductCardFragment>>,
    currencyCode: string,
): Promise<Record<string, ProductCardPrice>> {
    const productsNeedingOverride = products
        .map(product => readFragment(ProductCardFragment, product))
        .filter(product => product.currencyCode !== currencyCode);

    if (productsNeedingOverride.length === 0) {
        return {};
    }

    const locale = await getRouteLocale();
    const entries = await Promise.all(
        productsNeedingOverride.map(async product => {
            // Use lightweight price-only query instead of full GetProductDetailQuery
            const result = await query(
                GetProductPriceBySlugQuery,
                {slug: product.slug},
                {languageCode: locale, currencyCode},
            );
            const prices = result.data?.product?.variants
                ?.map(variant => variant.priceWithTax)
                .filter((price): price is number => typeof price === 'number') ?? [];

            if (prices.length === 0) {
                return null;
            }

            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const price: ProductCardPrice = min === max
                ? {currencyCode, priceWithTax: {__typename: 'SinglePrice', value: min}}
                : {currencyCode, priceWithTax: {__typename: 'PriceRange', min, max}};

            return [product.productId, price] as const;
        }),
    );

    return Object.fromEntries(entries.filter((entry): entry is readonly [string, ProductCardPrice] => entry !== null));
}
