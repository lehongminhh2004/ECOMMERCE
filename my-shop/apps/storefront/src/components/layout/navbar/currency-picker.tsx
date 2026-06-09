'use client';

import {useTranslations} from 'next-intl';
import {Coins} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useRouter} from '@/i18n/navigation';
import {switchCurrency} from '@/lib/actions/switch-currency';
import {useEffect, useState, useTransition} from 'react';

interface CurrencyPickerProps {
    availableCurrencyCodes: string[];
    activeCurrencyCode: string;
}

export function CurrencyPicker({availableCurrencyCodes, activeCurrencyCode}: CurrencyPickerProps) {
    const t = useTranslations('Navigation');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(activeCurrencyCode);

    useEffect(() => {
        setSelectedCurrencyCode(activeCurrencyCode);
    }, [activeCurrencyCode]);

    const handleCurrencyChange = (currencyCode: string) => {
        if (currencyCode === selectedCurrencyCode) {
            return;
        }

        setSelectedCurrencyCode(currencyCode);
        startTransition(async () => {
            await switchCurrency(currencyCode);
            router.refresh();
        });
    };

    if (availableCurrencyCodes.length <= 1) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1.5" aria-label={t('switchCurrency')} />}>
                <Coins className="size-4" />
                <span>{selectedCurrencyCode}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableCurrencyCodes.map((code) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => handleCurrencyChange(code)}
                        disabled={isPending}
                    >
                        <span>{code}</span>
                        {selectedCurrencyCode === code && <span className="ml-auto text-xs">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
