'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ShoppingBag, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { OrderLine } from './types';
import { useCheckout } from './checkout-provider';
import { Price } from '@/components/commerce/price';
import {useTranslations} from 'next-intl';
import { getVendureAssetUrl, shouldUseUnoptimized } from '@/lib/utils';

function OrderSummaryContent({ order, t }: { order: ReturnType<typeof useCheckout>['order']; t: ReturnType<typeof useTranslations<'Checkout'>> }) {
  const totalSavings = order.discounts
    ? order.discounts.reduce((sum: number, d: { amountWithTax: number }) => sum + Math.abs(d.amountWithTax), 0)
    : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {order.lines.map((line: OrderLine) => (
          <div key={line.id} className="flex gap-3">
            {line.productVariant.product.featuredAsset ? (
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={getVendureAssetUrl(line.productVariant.product.featuredAsset.preview)}
                  alt={line.productVariant.name}
                  width={56}
                  height={56}
                  unoptimized={shouldUseUnoptimized(getVendureAssetUrl(line.productVariant.product.featuredAsset.preview))}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">
                {line.productVariant.product.name}
              </p>
              {line.productVariant.name !== line.productVariant.product.name && (
                <p className="text-xs text-muted-foreground">
                  {line.productVariant.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('qty', {quantity: line.quantity})}
              </p>
            </div>
            <div className="text-sm font-medium">
              <Price value={line.linePriceWithTax} currencyCode={order.currencyCode} />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span>
            <Price value={order.subTotalWithTax} currencyCode={order.currencyCode} />
          </span>
        </div>

        {order.discounts && order.discounts.length > 0 && (
          <>
            {order.discounts.map((discount: { description: string; amountWithTax: number }, index: number) => (
              <div key={index} className="flex justify-between text-sm items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 min-w-0">
                  <Tag className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{discount.description}</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                  −<Price value={Math.abs(discount.amountWithTax)} currencyCode={order.currencyCode} />
                </span>
              </div>
            ))}
          </>
        )}

        {/* Applied coupon codes badge */}
        {(order as { couponCodes?: string[] }).couponCodes && (order as { couponCodes?: string[] }).couponCodes!.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(order as { couponCodes?: string[] }).couponCodes!.map((code: string) => (
              <span key={code} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 tracking-wider">
                <Tag className="h-2.5 w-2.5" />
                {code}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('shipping')}</span>
          <span>
            {order.shippingWithTax > 0
              ? <Price value={order.shippingWithTax} currencyCode={order.currencyCode} />
              : t('toBeCalculated')}
          </span>
        </div>
      </div>

      {totalSavings > 0 && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            🎉 {t('youSave')}
          </span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <Price value={totalSavings} currencyCode={order.currencyCode} />
          </span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <span>{t('total')}</span>
        <span>
          <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
        </span>
      </div>
    </div>
  );
}


export default function OrderSummary() {
  const t = useTranslations('Checkout');
  const { order } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile: Collapsible summary */}
      <div className="lg:hidden">
        <Card>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {t('orderSummary')} ({order.lines.length} {order.lines.length === 1 ? t('item') : t('items')})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                    </span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <OrderSummaryContent order={order} t={t} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Desktop: Always visible sticky summary */}
      <div className="hidden lg:block">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>{t('orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderSummaryContent order={order} t={t} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
