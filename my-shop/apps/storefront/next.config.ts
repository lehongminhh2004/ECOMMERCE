import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
            }
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
