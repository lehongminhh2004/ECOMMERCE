import type {Metadata} from 'next';
import {getRouteLocale} from '@/i18n/server';
import {getTranslations} from 'next-intl/server';
import {Cart} from "@/app/[locale]/cart/cart";
import {Suspense} from "react";
import {CartSkeleton} from "@/components/shared/skeletons/cart-skeleton";
import {noIndexRobots} from '@/lib/metadata';
import {CouponNotification} from "@/app/[locale]/cart/coupon-notification";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});
    return {
        title: t('title'),
        robots: noIndexRobots(),
    };
}

export default async function CartPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});

    return (
        <div className="container mx-auto px-4 py-20">
            {/* Hiển thị toast khi redirect từ blog post sau khi áp mã coupon */}
            <Suspense fallback={null}>
                <CouponNotification />
            </Suspense>

            <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

            <Suspense fallback={<CartSkeleton />}>
                <Cart/>
            </Suspense>
        </div>
    );
}
