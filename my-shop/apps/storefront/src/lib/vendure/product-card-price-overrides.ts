import {readFragment, type FragmentOf} from '@/graphql';
import {getRouteLocale} from '@/i18n/server';
import {ProductCardFragment} from './fragments';
import {query} from './api';
import {GetProductDetailQuery} from './queries';

export type ProductCardPrice =
    | { currencyCode: string; priceWithTax: { __typename: 'PriceRange'; min: number; max: number } }
    | { currencyCode: string; priceWithTax: { __typename: 'SinglePrice'; value: number } };

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
            const result = await query(
                GetProductDetailQuery,
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
