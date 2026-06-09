'use server';

import {mutate} from '@/lib/vendure/api';
import {
    RemoveFromCartMutation,
    AdjustCartItemMutation,
    ApplyPromotionCodeMutation,
    RemovePromotionCodeMutation
} from '@/lib/vendure/mutations';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {updateTag} from 'next/cache';
import {getLocale} from 'next-intl/server';

export async function removeFromCart(lineId: string) {
    const locale = await getLocale();
    const currencyCode = await getActiveCurrencyCode(locale);
    await mutate(RemoveFromCartMutation, {lineId}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}

export async function adjustQuantity(lineId: string, quantity: number) {
    const locale = await getLocale();
    const currencyCode = await getActiveCurrencyCode(locale);
    await mutate(AdjustCartItemMutation, {lineId, quantity}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}

export async function applyPromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    const normalizedCode = code?.trim().toUpperCase();
    if (!normalizedCode) {
        return {ok: false, error: 'Missing promotion code'};
    }

    try {
        const locale = await getLocale();
        const currencyCode = await getActiveCurrencyCode(locale);
        const {data} = await mutate(ApplyPromotionCodeMutation, {couponCode: normalizedCode}, {useAuthToken: true, languageCode: locale, currencyCode});
        const result = (data as any)?.applyCouponCode;
        if (!result || result.__typename !== 'Order') {
            return {ok: false, error: result?.message || 'Unable to apply promotion code'};
        }
        updateTag('cart');
        return {ok: true};
    } catch (error) {
        console.error('[Cart] Failed to apply promotion code:', error);
        return {ok: false, error: 'Unable to apply promotion code'};
    }
}

export async function removePromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    const locale = await getLocale();
    const currencyCode = await getActiveCurrencyCode(locale);
    await mutate(RemovePromotionCodeMutation, {couponCode: code}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}
