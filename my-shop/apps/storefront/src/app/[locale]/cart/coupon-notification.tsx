'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

export function CouponNotification() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Cart');
    const toastShownRef = useRef(false);

    useEffect(() => {
        const coupon = searchParams.get('coupon');
        const applied = searchParams.get('applied');
        const error = searchParams.get('error');

        if (!coupon || toastShownRef.current) return;
        toastShownRef.current = true;

        if (applied === '1') {
            toast.success(t('couponAppliedTitle', { code: coupon }), {
                description: t('couponAppliedDescription'),
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                duration: 4000,
            });
        } else if (error === 'invalid_code') {
            toast.error(t('couponInvalidTitle', { code: coupon }), {
                description: t('couponInvalidDescription'),
                icon: <AlertCircle className="h-4 w-4" />,
                duration: 5000,
            });
        } else if (error === 'already_applied') {
            toast.info(t('couponAlreadyAppliedTitle', { code: coupon }), {
                description: t('couponAlreadyAppliedDescription'),
                icon: <Info className="h-4 w-4" />,
                duration: 4000,
            });
        } else if (error === 'order_not_found') {
            toast.warning(t('couponOrderNotFoundTitle', { code: coupon }), {
                description: t('couponOrderNotFoundDescription'),
                duration: 5000,
            });
        } else if (error === 'error') {
            toast.error(t('couponConnectionErrorTitle', { code: coupon }), {
                description: t('couponConnectionErrorDescription'),
                duration: 6000,
            });
        }

        router.replace(pathname, { scroll: false });
    }, [searchParams, pathname, router, t]);

    return null;
}
