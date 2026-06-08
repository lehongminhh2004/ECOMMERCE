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

export function PromotionCode({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = useTranslations('Cart');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isPendingApply, startApplyTransition] = useTransition();
    const [isPendingRemove, startRemoveTransition] = useTransition();

    const handleApply = async () => {
        if (!code.trim()) {
            setError(t('enterCode'));
            return;
        }
        setError('');
        startApplyTransition(async () => {
            const formData = new FormData();
            formData.set('code', code.trim().toUpperCase());
            try {
                await applyPromotionCode(formData);
                setCode('');
            } catch {
                setError(t('invalidCode'));
            }
        });
    };

    const handleRemove = async (c: string) => {
        startRemoveTransition(async () => {
            const formData = new FormData();
            formData.set('code', c);
            await removePromotionCode(formData);
        });
    };

    const hasCodes = activeOrder.couponCodes && activeOrder.couponCodes.length > 0;

    return (
        <Card className="mt-4 overflow-hidden">
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
                        <div className="flex gap-2 pt-1">
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
                                onClick={handleApply}
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
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
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
                                onClick={handleApply}
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
