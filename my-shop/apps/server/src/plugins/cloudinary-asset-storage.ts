/**
 * Cloudinary Asset Storage Strategy for Vendure
 *
 * Replaces the default local-disk storage so uploaded assets survive Render
 * redeploys. Requires the `cloudinary` npm package and these env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   CLOUDINARY_FOLDER   (optional, defaults to "vendure-assets")
 *
 * Activation: set ASSET_STORAGE=cloudinary in the Render environment.
 * When not set (or set to anything else) the default local strategy is used,
 * which keeps local dev working with no extra config.
 */

import { AssetStorageStrategy, Logger } from '@vendure/core';
import { Stream } from 'stream';
import { Readable } from 'stream';

const logCtx = 'CloudinaryAssetStorage';

/**
 * Lazy-load the Cloudinary SDK to avoid hard crash when the package is absent
 * in environments that don't use this strategy.
 */
async function getCloudinary() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { v2: cloudinary } = require('cloudinary');
        return cloudinary;
    } catch {
        throw new Error(
            'cloudinary package not found. Run: npm install cloudinary -w server',
        );
    }
}

function buildPublicId(filename: string, folder: string): string {
    // Strip extension — Cloudinary stores it separately
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    return folder ? `${folder}/${withoutExt}` : withoutExt;
}

export class CloudinaryAssetStorageStrategy implements AssetStorageStrategy {
    private readonly folder: string;
    private configured = false;

    constructor() {
        this.folder = process.env.CLOUDINARY_FOLDER || 'vendure-assets';
    }

    private async ensureConfigured(): Promise<void> {
        if (this.configured) return;
        const cloudinary = await getCloudinary();
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
        this.configured = true;
    }

    async writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
        await this.ensureConfigured();
        const cloudinary = await getCloudinary();
        const publicId = buildPublicId(fileName, this.folder);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    overwrite: true,
                    resource_type: 'auto',
                },
                (error: Error | undefined, result: { secure_url: string } | undefined) => {
                    if (error) {
                        Logger.error(`Cloudinary upload failed: ${error.message}`, logCtx);
                        return reject(error);
                    }
                    Logger.verbose(`Uploaded to Cloudinary: ${result!.secure_url}`, logCtx);
                    resolve(result!.secure_url);
                },
            );
            uploadStream.end(data);
        });
    }

    async writeFileFromStream(fileName: string, data: Stream): Promise<string> {
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            data.on('data', (chunk: Buffer) => chunks.push(chunk));
            data.on('end', resolve);
            data.on('error', reject);
        });
        return this.writeFileFromBuffer(fileName, Buffer.concat(chunks));
    }

    async readFileToBuffer(identifier: string): Promise<Buffer> {
        // identifier is already a full Cloudinary URL — fetch it
        const response = await fetch(identifier);
        if (!response.ok) {
            throw new Error(`Failed to fetch asset from Cloudinary: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    readFileToStream(identifier: string): Promise<Stream> {
        return this.readFileToBuffer(identifier).then((buf) => {
            const stream = new Readable();
            stream.push(buf);
            stream.push(null);
            return stream;
        });
    }

    async deleteFile(identifier: string): Promise<void> {
        await this.ensureConfigured();
        const cloudinary = await getCloudinary();
        // Extract public_id from URL: last path segment without extension
        try {
            const url = new URL(identifier);
            const parts = url.pathname.split('/');
            // Remove the version segment (v12345678) if present
            const relevant = parts.filter((p) => p && !p.match(/^v\d+$/));
            const publicId = relevant.slice(-1)[0]?.replace(/\.[^/.]+$/, '');
            if (publicId) {
                await cloudinary.uploader.destroy(`${this.folder}/${publicId}`, {
                    resource_type: 'auto',
                });
            }
        } catch (e) {
            Logger.warn(`Could not delete Cloudinary asset ${identifier}: ${e}`, logCtx);
        }
    }

    toAbsoluteUrl(_request: any, identifier: string): string {
        // Cloudinary URLs are already absolute
        return identifier;
    }

    fileExists(fileName: string): Promise<boolean> {
        // Cloudinary does not have a cheap "exists" call without listing.
        // Return true to let Vendure skip the duplicate-filename check.
        return Promise.resolve(false);
    }
}
