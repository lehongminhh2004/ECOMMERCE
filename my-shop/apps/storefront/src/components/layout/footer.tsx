import { getRouteLocale } from '@/i18n/server';
import { cacheLife, cacheTag } from 'next/cache';
import { getTopCollections } from '@/lib/vendure/cached';
import Image from "next/image";
import { NavigationLink } from '@/components/shared/navigation-link';
import { getTranslations } from 'next-intl/server';
import { getFooter } from '@/lib/payload/api';
import { Link2 } from 'lucide-react';

const COPYRIGHT_YEAR = 2026;

async function Copyright({ locale }: { locale: string }) {
    'use cache'
    cacheLife('days');

    const t = await getTranslations({ locale, namespace: 'Footer' });

    return (
        <div>
            &copy; {COPYRIGHT_YEAR} {t('copyright')}
        </div>
    )
}

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

function getSocialIcon(platform: string) {
    switch (platform?.toLowerCase()) {
        case 'facebook':
            return FacebookIcon;
        case 'twitter':
            return TwitterIcon;
        case 'instagram':
            return InstagramIcon;
        case 'github':
            return GithubIcon;
        default:
            return (props: React.SVGProps<SVGSVGElement>) => <Link2 className="h-5 w-5" {...props} />;
    }
}

const cmsLinkTranslations: Record<string, string> = {
    'Shop': 'Cửa hàng',
    'Deals': 'Ưu đãi',
    'Summer Sale': 'Khuyến mãi hè',
    'Terms of Service': 'Điều khoản dịch vụ',
    'Privacy Policy': 'Chính sách bảo mật',
    'About Us': 'Giới thiệu',
    'Contact': 'Liên hệ',
};

function getCmsLinkLabel(label: string, locale: string) {
    if (locale === 'vi') {
        return cmsLinkTranslations[label] || label;
    }
    return label;
}

export async function Footer({ locale }: { locale: string }) {
    'use cache'
    cacheLife('days');

    cacheTag(`footer-${locale}`);

    const t = await getTranslations({ locale, namespace: 'Footer' });
    const collections = await getTopCollections(locale);
    const cmsFooter = await getFooter();

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <NavigationLink href="/" className="inline-block mb-4">
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-6 w-auto dark:invert" />
                        </NavigationLink>
                        <p className="text-sm text-muted-foreground text-balance leading-relaxed mb-6">
                            {cmsFooter?.contactInfo || t('description')}
                        </p>
                        {cmsFooter?.socialLinks && cmsFooter.socialLinks.length > 0 && (
                            <div className="flex items-center gap-4">
                                {cmsFooter.socialLinks.map((social, index) => {
                                    const Icon = getSocialIcon(social.platform);
                                    return (
                                        <a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                                            aria-label={social.platform}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('categories')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <NavigationLink
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {collection.name}
                                    </NavigationLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('customer')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <NavigationLink
                                    href="/search"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('shopAll')}
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink
                                    href="/account/orders"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('orders')}
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink
                                    href="/account/profile"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('account')}
                                </NavigationLink>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">
                            {cmsFooter?.links && cmsFooter.links.length > 0 ? t('linksTitle', { defaultValue: 'Links' }) : t('vendure')}
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {cmsFooter?.links && cmsFooter.links.length > 0 ? (
                                cmsFooter.links.map((link, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={link.url}
                                            target={link.url.startsWith('http') ? '_blank' : undefined}
                                            rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {getCmsLinkLabel(link.label, locale)}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li>
                                        <a
                                            href="https://github.com/vendure-ecommerce"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('github')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://docs.vendure.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('documentation')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://github.com/vendure-ecommerce/vendure"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('sourceCode')}
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div
                    className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <Copyright locale={locale} />
                    <div className="flex items-center gap-2">
                        <span>{t('poweredBy')}</span>
                        <a
                            href="https://vendure.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-4 w-auto dark:invert" />
                        </a>
                        <span>&</span>
                        <a
                            href="https://nextjs.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <Image src="/next.svg" alt="Next.js" width={16} height={16} className="h-5 w-auto dark:invert" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
