'use client';

import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bookmark, BookmarkX, CheckCircle2, Copy, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyCouponAndGoToCart } from '@/app/[locale]/blog/actions';
import { toIntlLocale } from '@/i18n/locale-utils';

const SAVED_COUPONS_KEY = 'saved_coupons';

interface SavedCoupon {
    code: string;
    label: string;
    savedAt: string;
}

function getSavedCoupons(): SavedCoupon[] {
    try {
        const raw = localStorage.getItem(SAVED_COUPONS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function removeSavedCoupon(code: string) {
    const existing = getSavedCoupons();
    localStorage.setItem(SAVED_COUPONS_KEY, JSON.stringify(existing.filter(c => c.code !== code)));
}

export function SavedCoupons() {
    const locale = useLocale();
    const intlLocale = toIntlLocale(locale);
    const t = useTranslations('Account');
    const [coupons, setCoupons] = useState<SavedCoupon[]>([]);
    const [mounted, setMounted] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [applyingCode, setApplyingCode] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        setCoupons(getSavedCoupons());
    }, []);

    const handleRemove = (code: string) => {
        removeSavedCoupon(code);
        setCoupons(getSavedCoupons());
    };

    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleApply = (code: string) => {
        setApplyingCode(code);
        startTransition(async () => {
            await applyCouponAndGoToCart(code);
        });
    };

    if (!mounted) return null;

    if (coupons.length === 0) {
        return (
            <div className="text-center py-10 border border-dashed rounded-xl border-border">
                <Bookmark className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{t('noSavedCoupons')}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    {t('noSavedCouponsDescription')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {coupons.map((coupon) => {
                const savedDate = new Intl.DateTimeFormat(intlLocale).format(new Date(coupon.savedAt));

                return (
                    <div
                        key={coupon.code}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono font-black text-lg text-primary tracking-wider">
                                    {coupon.code}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{coupon.label}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                {t('savedAt', { date: savedDate })}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => handleCopy(coupon.code)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title={t('copyCode')}
                            >
                                {copiedCode === coupon.code
                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    : <Copy className="h-4 w-4" />
                                }
                            </button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1"
                                disabled={isPending && applyingCode === coupon.code}
                                onClick={() => handleApply(coupon.code)}
                            >
                                <ShoppingCart className="h-3 w-3" />
                                {isPending && applyingCode === coupon.code ? t('applyingCoupon') : t('applyCoupon')}
                            </Button>

                            <button
                                onClick={() => handleRemove(coupon.code)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title={t('removeSavedCoupon')}
                            >
                                <BookmarkX className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
