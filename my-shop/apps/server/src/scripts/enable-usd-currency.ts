import 'dotenv/config';
import {
    bootstrapWorker,
    ChannelService,
    CurrencyCode,
    LanguageCode,
    ProductVariantService,
    RequestContextService,
} from '@vendure/core';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { config } from '../vendure-config';

const fallbackVndPerUsd = Number(process.env.VND_PER_USD ?? 25000);

function getUsdPricesFromBackup() {
    const backupPath = path.join(__dirname, '../../backup.sql');

    if (!existsSync(backupPath)) {
        return new Map<number, number>();
    }

    const backup = readFileSync(backupPath, 'utf8');
    const copyStart = backup.indexOf('COPY public.product_variant_price');
    const copyEnd = backup.indexOf('\\.', copyStart);

    if (copyStart === -1 || copyEnd === -1) {
        return new Map<number, number>();
    }

    const rows = backup.slice(copyStart, copyEnd).split(/\r?\n/).slice(1);
    const prices = new Map<number, number>();

    for (const row of rows) {
        const columns = row.split('\t');
        const currencyCode = columns[2];

        if (currencyCode !== 'USD') {
            continue;
        }

        const price = Number(columns[5]);
        const variantId = Number(columns[6]);

        if (Number.isFinite(price) && Number.isFinite(variantId)) {
            prices.set(variantId, price);
        }
    }

    return prices;
}

async function main() {
    const worker = await bootstrapWorker(config);
    const requestContextService = worker.app.get(RequestContextService);
    const channelService = worker.app.get(ChannelService);
    const productVariantService = worker.app.get(ProductVariantService);
    const backupPrices = getUsdPricesFromBackup();
    const ctx = await requestContextService.create({
        apiType: 'admin',
        languageCode: LanguageCode.en,
    });

    const channel = await channelService.getDefaultChannel(ctx);

    if (!channel) {
        throw new Error('No Vendure channel found');
    }

    const currencies = new Set(channel.availableCurrencyCodes);
    currencies.add(CurrencyCode.VND);
    currencies.add(CurrencyCode.USD);

    const updatedChannel = await channelService.update(ctx, {
        id: channel.id,
        availableCurrencyCodes: Array.from(currencies),
    });

    if ('errorCode' in updatedChannel) {
        throw new Error(updatedChannel.message);
    }

    const variants = await productVariantService.findAll(ctx, {take: 1000});
    let created = 0;

    for (const variant of variants.items) {
        const prices = await productVariantService.getProductVariantPrices(ctx, variant.id);
        const existingUsdPrice = prices.find(price => price.channelId === channel.id && price.currencyCode === CurrencyCode.USD);

        if (existingUsdPrice) {
            continue;
        }

        const vndPrice = prices.find(price => price.channelId === channel.id && price.currencyCode === CurrencyCode.VND);
        const usdPrice = backupPrices.get(Number(variant.id))
            ?? (vndPrice ? Math.max(1, Math.round((vndPrice.price / fallbackVndPerUsd) * 100)) : undefined);

        if (usdPrice == null) {
            continue;
        }

        await productVariantService.createOrUpdateProductVariantPrice(
            ctx,
            variant.id,
            usdPrice,
            channel.id,
            CurrencyCode.USD,
        );
        created += 1;
    }

    await worker.app.close();

    console.log(`USD enabled for channel ${channel.id}. Created ${created} USD prices.`);
}

main().catch(async error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
