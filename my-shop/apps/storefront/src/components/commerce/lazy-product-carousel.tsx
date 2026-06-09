'use client';

import dynamic from 'next/dynamic';
import type {FragmentOf} from '@/graphql';
import type {ProductCardFragment} from '@/lib/vendure/fragments';
import type {ProductCardPrice} from '@/lib/vendure/product-card-price-overrides';

// Client Component wrapper — dynamic import với ssr:false được phép ở đây.
// Embla carousel JS chỉ được parse sau khi client hydrate, không block LCP.
const ProductCarousel = dynamic(
    () => import('@/components/commerce/product-carousel').then(m => m.ProductCarousel),
    {
        ssr: false,
        loading: () => (
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="h-10 w-48 rounded-lg bg-muted animate-pulse mb-8" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className="min-w-[calc(100%-1rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.33%-1rem)] xl:min-w-[calc(25%-1rem)] aspect-[3/4] rounded-xl bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        ),
    }
);

interface LazyProductCarouselProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
    priceOverrides?: Record<string, ProductCardPrice>;
}

export function LazyProductCarousel(props: LazyProductCarouselProps) {
    return <ProductCarousel {...props} />;
}
