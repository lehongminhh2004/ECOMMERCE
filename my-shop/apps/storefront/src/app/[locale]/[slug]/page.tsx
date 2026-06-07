import type {Metadata} from "next";
import {Suspense} from "react";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {getRouteLocale} from "@/i18n/server";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {toOgLocale} from '@/i18n/locale-utils';
import { getPageBySlug } from "@/lib/payload/api";
import { RenderBlocks } from "@/components/shared/render-blocks";

interface PageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    await connection();
    const { slug } = await params;
    const locale = await getRouteLocale();
    const ogLocale = toOgLocale(locale);

    const payloadPage = await getPageBySlug(slug);
    if (!payloadPage) {
        return {
            title: `${SITE_NAME} - Page Not Found`,
        };
    }

    return {
        title: `${SITE_NAME} - ${payloadPage.title}`,
        alternates: {
            canonical: buildCanonicalUrl(`/${slug}`),
        },
        openGraph: {
            title: `${SITE_NAME} - ${payloadPage.title}`,
            type: "website",
            locale: ogLocale,
            url: `${SITE_URL}/${slug}`,
        },
    };
}

async function DynamicPageContent({ params }: { params: PageProps["params"] }) {
    await connection();
    const { slug } = await params;
    const payloadPage = await getPageBySlug(slug);
    
    // If the page doesn't exist or is the home page (handled by root route), return 404
    if (!payloadPage || slug === 'home') {
        notFound();
    }

    return (
        <div className="min-h-screen container mx-auto px-4 pt-24 pb-8 md:pt-28">
            {payloadPage.layout && payloadPage.layout.length > 0 ? (
                <RenderBlocks blocks={payloadPage.layout} />
            ) : (
                <div className="py-20 text-center text-muted-foreground">
                    This page has no content blocks yet.
                </div>
            )}
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="min-h-screen container mx-auto px-4 py-24 space-y-8 animate-pulse">
            <div className="h-48 bg-muted rounded-3xl w-full" />
            <div className="h-10 bg-muted rounded w-48" />
            <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-full" />
                <div className="h-6 bg-muted rounded w-5/6" />
                <div className="h-6 bg-muted rounded w-2/3" />
            </div>
        </div>
    );
}

export default function Page({ params }: PageProps) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <DynamicPageContent params={params} />
        </Suspense>
    );
}
