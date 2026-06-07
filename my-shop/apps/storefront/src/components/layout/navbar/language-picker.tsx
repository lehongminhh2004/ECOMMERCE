'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing, localeNames} from '@/i18n/routing';
import {Globe} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {switchLocaleCurrency} from '@/lib/actions/switch-locale';
import {useTransition} from 'react';
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

    const handleLocaleChange = (newLocale: string) => {
        startTransition(async () => {
            await switchLocaleCurrency(newLocale);
            router.replace(pathname, {locale: newLocale});
            router.refresh();
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1.5" />}>
                <Globe className="size-4" />
                <span>{localeNames[locale as keyof typeof localeNames] ?? locale.toUpperCase()}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {routing.locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => handleLocaleChange(loc)}
                        disabled={isPending}
                    >
                        <span>{localeNames[loc] ?? loc.toUpperCase()}</span>
                        {locale === loc && <span className="ml-auto text-xs">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
