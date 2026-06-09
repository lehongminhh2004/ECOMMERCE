'use client';

import {useState, useTransition} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tag, X, CheckCircle2, Loader2} from 'lucide-react';
import {applyPromotionCode, removePromotionCode} from './actions';
import {useTranslations} from 'next-intl';

type ActiveOrder = {
    id: string;
    couponCodes?: string[] | null;
};

type CouponOption = {
    code: string;
    title: string;
    discountLabel?: string | null;
    discountPercent?: number | null;
    expiresAt?: string | null;
};

export function PromotionCode({
    activeOrder,
    availableCoupons = [],
}: {
    activeOrder: ActiveOrder;
    availableCoupons?: CouponOption[];
}) {
    const t = useTranslations('Cart');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isPendingApply, startApplyTransition] = useTransition();
    const [isPendingRemove, startRemoveTransition] = useTransition();

    const appliedCodes = new Set((activeOrder.couponCodes || []).map((c) => c.toUpperCase()));
    const hasCodes = appliedCodes.size > 0;

    const handleApply = async (selectedCode = code) => {
        const normalizedCode = selectedCode.trim().toUpperCase();
        if (!normalizedCode) {
            setError(t('enterCode'));
            return;
        }
        setError('');
        startApplyTransition(async () => {
            const formData = new FormData();
            formData.set('code', normalizedCode);
            const result = await applyPromotionCode(formData);
            if (result?.ok) {
                setCode('');
                return;
            }
            setError(result?.error || t('invalidCode'));
        });
    };

    const handleRemove = async (c: string) => {
        startRemoveTransition(async () => {
            const formData = new FormData();
            formData.set('code', c);
            await removePromotionCode(formData);
        });
    };

    return (
        <Card className="overflow-visible">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary"/>
                    {t('promotionCode')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('enterDiscountCode')}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {hasCodes ? (
                    <div className="space-y-2">
                        {activeOrder.couponCodes!.map((c) => (
                            <div
                                key={c}
                                className="flex items-center justify-between p-2.5 border rounded-lg bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0"/>
                                    <span className="font-mono font-semibold text-sm text-emerald-700 dark:text-emerald-300 tracking-wider">
                                        {c}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemove(c)}
                                    disabled={isPendingRemove}
                                    className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                    aria-label={t('remove')}
                                >
                                    {isPendingRemove
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                                        : <X className="h-3.5 w-3.5"/>
                                    }
                                </button>
                            </div>
                        ))}

                        {/* Allow adding another code */}
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-1">
                            <Input
                                id="promo-code-input"
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    if (error) setError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                placeholder={t('enterCode')}
                                className="flex-1 font-mono text-sm h-9"
                            />
                            <Button
                                onClick={() => handleApply()}
                                disabled={isPendingApply || !code.trim()}
                                size="sm"
                                className="h-9"
                            >
                                {isPendingApply
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                                    : t('apply')
                                }
                            </Button>
                        </div>
                        <CouponOptions
                            coupons={availableCoupons}
                            appliedCodes={appliedCodes}
                            isPending={isPendingApply}
                            onSelect={setCode}
                            onApply={handleApply}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                            <Input
                                id="promo-code-input"
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    if (error) setError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                placeholder={t('enterCode')}
                                className={`flex-1 font-mono text-sm ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            <Button
                                onClick={() => handleApply()}
                                disabled={isPendingApply || !code.trim()}
                            >
                                {isPendingApply
                                    ? <Loader2 className="h-4 w-4 animate-spin mr-1"/>
                                    : null
                                }
                                {t('apply')}
                            </Button>
                        </div>
                        {error && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <X className="h-3 w-3"/>
                                {error}
                            </p>
                        )}
                        <CouponOptions
                            coupons={availableCoupons}
                            appliedCodes={appliedCodes}
                            isPending={isPendingApply}
                            onSelect={setCode}
                            onApply={handleApply}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CouponOptions({
    coupons,
    appliedCodes,
    isPending,
    onSelect,
    onApply,
}: {
    coupons: CouponOption[];
    appliedCodes: Set<string>;
    isPending: boolean;
    onSelect: (code: string) => void;
    onApply: (code: string) => void;
}) {
    const t = useTranslations('Cart');

    if (coupons.length === 0) return null;

    return (
        <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                    {t('availableCoupons')}
                </p>
                <span className="text-[11px] text-muted-foreground">
                    {coupons.length}
                </span>
            </div>
            <div className="space-y-3">
                {coupons.map((coupon) => {
                    const isApplied = appliedCodes.has(coupon.code);
                    const label = coupon.discountLabel
                        || (coupon.discountPercent ? `${coupon.discountPercent}% OFF` : null);

                    return (
                        <div
                            key={coupon.code}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-muted/25 p-2.5"
                        >
                            <button
                                type="button"
                                onClick={() => onSelect(coupon.code)}
                                className="min-w-0 flex-1 text-left"
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-mono text-sm font-semibold tracking-wider">
                                        {coupon.code}
                                    </span>
                                    {label && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                            {label}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {coupon.title}
                                </p>
                            </button>
                            <Button
                                type="button"
                                size="sm"
                                variant={isApplied ? 'secondary' : 'outline'}
                                disabled={isPending || isApplied}
                                onClick={() => onApply(coupon.code)}
                                className="h-8 shrink-0"
                            >
                                {isApplied ? t('applied') : t('apply')}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
