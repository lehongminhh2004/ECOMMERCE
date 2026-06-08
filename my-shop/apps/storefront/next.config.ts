import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const remoteImagePatterns = [
    process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL,
    process.env.VENDURE_SHOP_API_URL,
    process.env.NEXT_PUBLIC_PAYLOAD_API_URL,
    process.env.PAYLOAD_API_URL,
]
    .flatMap((value) => {
        if (!value) {
            return [];
        }
        try {
            const url = new URL(value);
            return [{
                protocol: url.protocol.replace(':', '') as 'http' | 'https',
                hostname: url.hostname,
                port: url.port || undefined,
            }];
        } catch {
            return [];
        }
    });

const nextConfig: NextConfig = {
    output: 'standalone',
    cacheComponents: true,
    images: {
        // This is necessary to display images from your local Vendure instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
            },
            {
                hostname: 'localhost'
            },
            {
                hostname: 'vendure_server'
            },
            {
                hostname: 'payload_cms'
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com'
            },
            // Render.com deployed services — covers all *.onrender.com subdomains
            {
                protocol: 'https',
                hostname: '**.onrender.com',
            },
            ...remoteImagePatterns,
        ],
    },
    experimental: {
        rootParams: true
    },
    turbopack: {
        root: path.resolve(__dirname, '../..'),
    },
};

export default withNextIntl(nextConfig);
