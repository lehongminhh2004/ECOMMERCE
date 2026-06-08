import {readFragment, ResultOf} from '@/graphql';
import {ProductCard} from './product-card';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Pagination} from '@/components/shared/pagination';
import {SortDropdown} from './sort-dropdown';
import {SearchProductsQuery} from "@/lib/vendure/queries";
import {getRouteLocale} from '@/i18n/server';
import {getTranslations} from 'next-intl/server';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {getProductCardPriceOverrides} from '@/lib/vendure/product-card-price-overrides';
import type {ProductCardPrice} from '@/lib/vendure/product-card-price-overrides';

interface ProductGridProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
}

export async function ProductGrid({productDataPromise, currentPage, take}: ProductGridProps) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});
    const currencyCode = await getActiveCurrencyCode(locale);
    const result = await productDataPromise;

    const searchResult = result.data?.search;
    const priceOverrides = searchResult
        ? await getProductCardPriceOverrides(searchResult.items, currencyCode)
        : {};
    const totalPages = searchResult ? Math.ceil(searchResult.totalItems / take) : 0;

    if (!searchResult || !searchResult.items.length) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noProductsFound')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {t('productCount', {count: searchResult.totalItems})}
                </p>
                <SortDropdown/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResult.items.map((product, i) => (
                    <ProductGridItem
                        key={'product-grid-item' + i}
                        product={product}
                        priceOverrides={priceOverrides}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages}/>
            )}
        </div>
    );
}

function ProductGridItem({
    product: productProp,
    priceOverrides,
}: {
    product: ResultOf<typeof SearchProductsQuery>['search']['items'][number];
    priceOverrides: Record<string, ProductCardPrice>;
}) {
    const product = readFragment(ProductCardFragment, productProp);

    return <ProductCard product={productProp} priceOverride={priceOverrides[product.productId]}/>;
}
