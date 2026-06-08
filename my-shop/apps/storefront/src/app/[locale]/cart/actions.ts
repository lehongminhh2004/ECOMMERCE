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
    const currencyCode = await getActiveCurrencyCode();
    const locale = await getLocale();
    await mutate(RemoveFromCartMutation, {lineId}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}

export async function adjustQuantity(lineId: string, quantity: number) {
    const currencyCode = await getActiveCurrencyCode();
    const locale = await getLocale();
    await mutate(AdjustCartItemMutation, {lineId, quantity}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}

export async function applyPromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    const currencyCode = await getActiveCurrencyCode();
    const locale = await getLocale();
    const {data} = await mutate(ApplyPromotionCodeMutation, {couponCode: code.trim().toUpperCase()}, {useAuthToken: true, languageCode: locale, currencyCode});
    const result = (data as any)?.applyCouponCode;
    if (!result || result.__typename !== 'Order') {
        throw new Error(result?.message || 'Unable to apply promotion code');
    }
    updateTag('cart');
}

export async function removePromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    const currencyCode = await getActiveCurrencyCode();
    const locale = await getLocale();
    await mutate(RemovePromotionCodeMutation, {couponCode: code}, {useAuthToken: true, languageCode: locale, currencyCode});
    updateTag('cart');
}
