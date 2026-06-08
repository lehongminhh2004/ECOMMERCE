'use client';

import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bookmark, BookmarkCheck, CheckCircle2, Clock, Copy, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyCouponAndGoToCart } from '@/app/[locale]/blog/actions';
import { toIntlLocale } from '@/i18n/locale-utils';

interface CouponBannerProps {
    couponCode: string;
    discountLabel?: string | null;
    discountPercent?: number | null;
    expiresAt?: string | null;
    postTitle: string;
}

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

function saveCoupon(coupon: SavedCoupon) {
    const existing = getSavedCoupons();
    const filtered = existing.filter(c => c.code !== coupon.code);
    localStorage.setItem(SAVED_COUPONS_KEY, JSON.stringify([coupon, ...filtered]));
}

function removeSavedCoupon(code: string) {
    const existing = getSavedCoupons();
    localStorage.setItem(SAVED_COUPONS_KEY, JSON.stringify(existing.filter(c => c.code !== code)));
}

export function CouponBanner({
    couponCode,
    discountLabel,
    discountPercent,
    expiresAt,
    postTitle,
}: CouponBannerProps) {
    const locale = useLocale();
    const intlLocale = toIntlLocale(locale);
    const t = useTranslations('Blog');
    const [copied, setCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    const displayCode = couponCode.trim().toUpperCase();
    const badgeLabel = discountLabel || (discountPercent ? `−${discountPercent}%` : null);

    useEffect(() => {
        const saved = getSavedCoupons();
        setIsSaved(saved.some(c => c.code === displayCode));
    }, [displayCode]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = displayCode;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleApply = () => {
        startTransition(async () => {
            await applyCouponAndGoToCart(displayCode);
        });
    };

    const handleSave = () => {
        if (isSaved) {
            removeSavedCoupon(displayCode);
            setIsSaved(false);
        } else {
            saveCoupon({
                code: displayCode,
                label: badgeLabel || postTitle,
                savedAt: new Date().toISOString(),
            });
            setIsSaved(true);
        }
    };

    const expiryDate = expiresAt ? new Date(expiresAt) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : false;
    const expiryText = expiryDate && !isExpired
        ? new Intl.DateTimeFormat(intlLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(expiryDate)
        : null;

    if (isExpired) {
        return (
            <div className="my-8 rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-5 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                    🕐 {t('couponExpired', { code: displayCode })}
                </p>
            </div>
        );
    }

    return (
        <div className="my-8 rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/5">
            <div className="bg-gradient-to-r from-primary/90 to-primary px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-primary-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-primary-foreground font-bold text-base leading-tight">{t('exclusiveOffer')}</p>
                        {expiryText && (
                            <p className="text-primary-foreground/70 text-xs flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {t('expiresAt', { date: expiryText })}
                            </p>
                        )}
                    </div>
                </div>
                {badgeLabel && (
                    <div className="bg-white/20 backdrop-blur-sm text-primary-foreground font-black text-xl px-4 py-1.5 rounded-xl border border-white/30">
                        {badgeLabel}
                    </div>
                )}
            </div>

            <div className="bg-card px-6 py-5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-2">{t('couponCode')}</p>

                <div className="flex items-center gap-3">
                    <div className="flex-1 border-2 border-dashed border-primary/40 rounded-xl bg-primary/5 px-5 py-3 flex items-center justify-between">
                        <span className="font-mono font-black text-2xl text-primary tracking-[0.15em]">
                            {displayCode}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                            aria-label={t('copyCode')}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-emerald-500">{t('copied')}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    <span>{t('copy')}</span>
                                </>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        title={isSaved ? t('unsaveCode') : t('saveCode')}
                        className={`flex-shrink-0 h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                            isSaved
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                                : 'border-border bg-muted/50 text-muted-foreground hover:border-amber-400 hover:text-amber-500'
                        }`}
                        aria-label={isSaved ? t('unsave') : t('save')}
                    >
                        {isSaved ? (
                            <BookmarkCheck className="h-5 w-5" />
                        ) : (
                            <Bookmark className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {isSaved && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <BookmarkCheck className="h-3 w-3" />
                        {t('savedMessage')}
                    </p>
                )}

                <div className="mt-4 flex gap-3">
                    <Button
                        onClick={handleApply}
                        disabled={isPending}
                        className="flex-1 h-11 font-semibold text-sm gap-2 rounded-xl"
                        size="lg"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isPending ? t('applying') : t('applyNow')}
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                    {t('couponHelpPrefix')}{' '}
                    {t('couponHelpSuffix')}{' '}
                    <span className="text-primary font-medium">{t('cartPage')}</span>.
                </p>
            </div>
        </div>
    );
}
