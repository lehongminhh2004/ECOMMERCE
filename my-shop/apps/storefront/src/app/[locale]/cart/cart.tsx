import {CartItems} from "@/app/[locale]/cart/cart-items";
import {OrderSummary} from "@/app/[locale]/cart/order-summary";
import {PromotionCode} from "@/app/[locale]/cart/promotion-code";
import {getRouteLocale} from "@/i18n/server";
import {getActiveCurrencyCode} from "@/lib/currency-server";
import {cacheLife, cacheTag} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetActiveOrderQuery} from "@/lib/vendure/queries";
import {getPosts} from "@/lib/payload/api";

export async function Cart() {
    "use cache: private"
    cacheLife('minutes');
    cacheTag('cart');

    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode(locale);
    const {data} = await query(GetActiveOrderQuery, {}, {
        useAuthToken: true,
        languageCode: locale,
        currencyCode,
    });

    const activeOrder = data.activeOrder;
    const posts = await getPosts();
    const now = Date.now();
    const availableCoupons = Array.from(
        new Map(
            posts
                .filter((post) => {
                    if (!post.couponCode?.trim()) return false;
                    if (!post.expiresAt) return true;
                    return new Date(post.expiresAt).getTime() > now;
                })
                .map((post) => {
                    const code = post.couponCode!.trim().toUpperCase();
                    return [code, {
                        code,
                        title: post.title,
                        discountLabel: post.discountLabel,
                        discountPercent: post.discountPercent,
                        expiresAt: post.expiresAt,
                    }];
                })
        ).values()
    );

    // Handle empty cart case
    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <CartItems activeOrder={activeOrder}/>

            <div className="lg:col-span-1 space-y-4">
                <OrderSummary activeOrder={activeOrder}/>
                <PromotionCode activeOrder={activeOrder} availableCoupons={availableCoupons}/>
            </div>
        </div>
    )
}
