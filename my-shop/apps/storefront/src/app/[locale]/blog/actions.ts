'use server';

import { mutate } from '@/lib/vendure/api';
import { ApplyPromotionCodeMutation } from '@/lib/vendure/mutations';
import { getActiveCurrencyCode } from '@/lib/currency-server';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

type ApplyResult = 'success' | 'invalid_code' | 'already_applied' | 'order_not_found' | 'error';

/**
 * Áp mã coupon Vendure vào giỏ hàng rồi redirect về trang cart.
 * Được gọi từ nút "Áp dụng ngay" trên trang bài viết khuyến mãi.
 * Truyền error state qua URL param để hiển thị toast cho user.
 */
export async function applyCouponAndGoToCart(couponCode: string) {
    if (!couponCode?.trim()) {
        redirect('/cart');
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    const currencyCode = await getActiveCurrencyCode();
    const locale = await getLocale();
    let result: ApplyResult = 'success';

    try {
        const { data } = await mutate(
            ApplyPromotionCodeMutation,
            { couponCode: normalizedCode },
            { useAuthToken: true, languageCode: locale, currencyCode }
        );

        // Kiểm tra kết quả từ mutation
        const applyResult = (data as any)?.applyCouponCode;
        if (
            applyResult?.__typename === 'CouponCodeInvalidError'
            || applyResult?.__typename === 'CouponCodeExpiredError'
            || applyResult?.__typename === 'CouponCodeLimitError'
        ) {
            result = 'invalid_code';
        } else if (applyResult?.__typename === 'Order') {
            const appliedCodes = Array.isArray(applyResult.couponCodes)
                ? applyResult.couponCodes.map((code: string) => code.toUpperCase())
                : [];
            result = appliedCodes.includes(normalizedCode) ? 'success' : 'already_applied';
            updateTag('cart');
        } else if (
            applyResult?.__typename === 'NoActiveOrderError'
            || applyResult?.__typename === 'OrderNotActiveError'
            || applyResult?.__typename === 'GuestCheckoutError'
        ) {
            result = 'order_not_found';
        } else {
            result = 'error';
        }
    } catch (error) {
        // Network/timeout error — Render cold start
        console.error('[Coupon] Failed to apply coupon:', error);
        result = 'error';
    }

    // Redirect về cart với thông báo phù hợp
    if (result === 'success') {
        redirect(`/cart?coupon=${encodeURIComponent(normalizedCode)}&applied=1`);
    } else {
        redirect(`/cart?coupon=${encodeURIComponent(normalizedCode)}&error=${result}`);
    }
}
