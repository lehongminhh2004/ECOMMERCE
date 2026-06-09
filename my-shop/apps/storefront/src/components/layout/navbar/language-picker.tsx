'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing, localeNames} from '@/i18n/routing';
import {Globe} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {switchLocaleCurrency} from '@/lib/actions/switch-locale';
import {useEffect, useState, useTransition} from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguagePicker() {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [selectedLocale, setSelectedLocale] = useState(locale);

    useEffect(() => {
        setSelectedLocale(locale);
    }, [locale]);

    const handleLocaleChange = (newLocale: string) => {
        if (newLocale === selectedLocale) {
            return;
        }

        setSelectedLocale(newLocale);
        startTransition(async () => {
            await switchLocaleCurrency(newLocale);
            router.replace(pathname, {locale: newLocale, scroll: false});
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1.5" aria-label={t('switchLanguage')} />}>
                <Globe className="size-4" />
                <span>{localeNames[selectedLocale as keyof typeof localeNames] ?? selectedLocale.toUpperCase()}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {routing.locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => handleLocaleChange(loc)}
                        disabled={isPending}
                    >
                        <span>{localeNames[loc] ?? loc.toUpperCase()}</span>
                        {selectedLocale === loc && <span className="ml-auto text-xs">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
