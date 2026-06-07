import Image from "next/image";
import { NavigationLink } from '@/components/shared/navigation-link';
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { LanguagePicker } from '@/components/layout/navbar/language-picker';
import { CurrencyPickerWrapper } from '@/components/layout/navbar/currency-picker-wrapper';
import { MobileNavWrapper } from '@/components/layout/navbar/mobile-nav-wrapper';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import { getNavigation } from "@/lib/payload/api";
import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from '@/components/ui/navigation-menu';

// Fallback navigation nếu CMS không có dữ liệu
const fallbackNavigationLinks = [
    { label: 'Shop', url: '/search' },
];

export async function Navbar({ locale }: { locale: string }) {
    const navigation = await getNavigation();
    const topAnnouncement = navigation?.topAnnouncement;
    // Labels từ CMS đã được localized sẵn theo locale truyền vào getNavigation()
    // Không cần hardcode translation mapping nữa
    const navigationLinks = navigation?.links?.length ? navigation.links : fallbackNavigationLinks;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/80">
            {topAnnouncement && (
                <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium">
                    {topAnnouncement}
                </div>
            )}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Suspense>
                            <MobileNavWrapper />
                        </Suspense>
                        <NavigationLink href="/" className="text-xl font-bold">
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-6 w-auto dark:invert" />
                        </NavigationLink>
                        <nav className="hidden md:flex items-center gap-6">
                            <Suspense>
                                <NavbarCollections locale={locale} />
                            </Suspense>
                            {navigationLinks.length > 0 && (
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        {navigationLinks.map((link, idx) => (
                                            <NavigationMenuItem key={idx}>
                                                <NavbarLink href={link.url}>
                                                    {link.label}
                                                </NavbarLink>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput/>
                            </Suspense>
                        </div>
                        <Suspense>
                            <LanguagePicker />
                        </Suspense>
                        <Suspense>
                            <CurrencyPickerWrapper />
                        </Suspense>
                        <Suspense>
                            <ThemeSwitcher />
                        </Suspense>
                        <Suspense>
                            <NavbarCart/>
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser/>
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
}
