import Image from 'next/image';
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Price} from '@/components/commerce/price';
import {Suspense} from "react";
import { Link } from '@/i18n/navigation';
import {useLocale, useTranslations} from 'next-intl';
import type {ProductCardPrice} from '@/lib/vendure/product-card-price-overrides';
import {getVendureAssetUrl, shouldUseUnoptimized} from '@/lib/utils';
import {getLocalizedProductName} from '@/lib/vendure/localized-overrides';

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
    priceOverride?: ProductCardPrice;
}

export function ProductCard({product: productProp, priceOverride}: ProductCardProps) {
    const locale = useLocale();
    const t = useTranslations('Product');
    const product = readFragment(ProductCardFragment, productProp);
    const priceWithTax = priceOverride?.priceWithTax ?? product.priceWithTax;
    const currencyCode = priceOverride?.currencyCode ?? product.currencyCode;
    const productName = getLocalizedProductName(product.slug, product.productName, locale);

    return (
        <Link
            href={`/product/${product.slug}`}
            prefetch={false}
            className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="aspect-square relative bg-muted overflow-hidden">
                {product.productAsset ? (
                    (() => {
                        const src = getVendureAssetUrl(product.productAsset.preview);
                        return (
                            <Image
                                src={src}
                                alt={productName}
                                fill
                                unoptimized={shouldUseUnoptimized(src)}
                                className="object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        );
                    })()
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {t('noImage')}
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {productName}
                </h3>
                <Suspense fallback={<div className="h-8 w-36 rounded bg-muted"></div>}>
                    <p className="text-lg font-bold tracking-tight">
                        {priceWithTax.__typename === 'PriceRange' ? (
                            priceWithTax.min !== priceWithTax.max ? (
                                <>
                                    <span className="text-xs font-normal text-muted-foreground mr-1">{t('from')}</span>
                                    <Price value={priceWithTax.min} currencyCode={currencyCode}/>
                                </>
                            ) : (
                                <Price value={priceWithTax.min} currencyCode={currencyCode}/>
                            )
                        ) : priceWithTax.__typename === 'SinglePrice' ? (
                            <Price value={priceWithTax.value} currencyCode={currencyCode}/>
                        ) : null}
                    </p>
                </Suspense>
            </div>
        </Link>
    );
}
