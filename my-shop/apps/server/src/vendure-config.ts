import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import 'dotenv/config';
import path from 'path';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;
const dbSslEnabled = process.env.DB_SSL === 'true';
const dbPoolMax = +(process.env.VENDURE_DB_POOL_MAX || 6);
const healthCheckMiddleware = (_req: any, res: any) => {
    res.status(200).json({ status: 'ok' });
};
const dbConnectionOptions = process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
    }
    : {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    };

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        middleware: [{
            route: 'health',
            handler: healthCheckMiddleware,
            beforeListen: true,
        }],
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiDebug: true,
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        schema: process.env.DB_SCHEMA,
        ...dbConnectionOptions,
        ...(dbSslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
        extra: {
            max: dbPoolMax,
        },
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {},
    plugins: [
        GraphiqlPlugin.init(),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: process.env.ASSET_URL_PREFIX || undefined,
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init(IS_DEV
            ? {
                devMode: true,
                outputPath: path.join(__dirname, '../static/email/test-emails'),
                route: 'mailbox',
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
                globalTemplateVars: {
                    fromAddress: '"example" <noreply@example.com>',
                    verifyEmailAddressUrl: 'http://localhost:3001/verify',
                    passwordResetUrl: 'http://localhost:3001/reset-password',
                    changeEmailAddressUrl: 'http://localhost:3001/account/verify-email'
                },
            }
            : {
                transport: { type: 'none' },
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
                globalTemplateVars: {
                    fromAddress: '"example" <noreply@example.com>',
                    verifyEmailAddressUrl: `${process.env.STOREFRONT_URL || 'http://localhost:3001'}/verify`,
                    passwordResetUrl: `${process.env.STOREFRONT_URL || 'http://localhost:3001'}/reset-password`,
                    changeEmailAddressUrl: `${process.env.STOREFRONT_URL || 'http://localhost:3001'}/account/verify-email`
                },
            }),
        DashboardPlugin.init({
            route: 'dashboard',
            appDir: IS_DEV
                ? path.join(__dirname, '../dist/dashboard')
                : path.join(__dirname, 'dashboard'),
        }),
    ],
};
