import { Link } from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Lock} from 'lucide-react';
import {Price} from '@/components/commerce/price';
import {getTranslations} from 'next-intl/server';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    discounts?: Array<{
        description: string;
        amountWithTax: number;
    }> | null;
};

export async function OrderSummary({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = await getTranslations('Cart');
    const totalSavings = activeOrder.discounts
        ? activeOrder.discounts.reduce((sum, d) => sum + Math.abs(d.amountWithTax), 0)
        : 0;

    return (
        <div className="border rounded-xl p-6 bg-card sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>

            <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>
                        <Price value={activeOrder.subTotalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>

                {activeOrder.discounts && activeOrder.discounts.length > 0 && (
                    <>
                        {activeOrder.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-sm items-center gap-2">
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                                    </svg>
                                    <span className="truncate">{discount.description}</span>
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                                    −<Price value={Math.abs(discount.amountWithTax)} currencyCode={activeOrder.currencyCode}/>
                                </span>
                            </div>
                        ))}
                    </>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('shipping')}</span>
                    <span>
                        {activeOrder.shippingWithTax > 0
                            ? <Price value={activeOrder.shippingWithTax} currencyCode={activeOrder.currencyCode}/>
                            : t('calculatedAtCheckout')}
                    </span>
                </div>
            </div>

            {totalSavings > 0 && (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2.5 mb-4">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        🎉 {t('youSave')}
                    </span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        <Price value={totalSavings} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
            )}

            <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-baseline text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-2xl">
                        <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
            </div>

            <Button render={<Link href="/checkout" />} nativeButton={false} className="w-full" size="lg">{t('proceedToCheckout')}</Button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{t('secureCheckout')}</span>
            </div>

            <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="w-full mt-3">{t('continueShopping')}</Button>
        </div>
    );
}
