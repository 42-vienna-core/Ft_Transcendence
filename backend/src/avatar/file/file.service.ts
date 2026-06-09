import { BadRequestException, Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, resolve } from 'path';
import sharp from 'sharp';
import { fileTypeFromFile } from 'file-type';

export const AVATAR_UPLOAD_DIR = '/uploads/avatars';

@Injectable()
export class FileService {
    private readonly allowedImageTypes = new Set([
        'image/jpeg',
        'image/png',
        'image/webp',
    ]);

    async removeFile(filename: string) {
        try {

            const safeName = basename(filename);
            const baseDir = resolve(AVATAR_UPLOAD_DIR);
            const filePath = resolve(baseDir, safeName);
            if (!filePath.startsWith(baseDir)) {
                throw new Error('Path traversal detected');
            }
            console.log('[FILE][DELETE]', filePath);
            await unlink(filePath);
        } catch (error: any) {
            const err = error as NodeJS.ErrnoException;
            if (err.code !== 'ENOENT') {
                console.error('[FILE][DELETE][ERROR]', err);
            }
        }
    }

    async validateImage(filePath: string) {

        const MAX_WIDTH = 4096;
        const MAX_HEIGHT = 4096;
        const MAX_PIXELS = 16_000_000;
        
        let type;

        try {
            type = await fileTypeFromFile(filePath);
        } catch {
            throw new BadRequestException('Cannot detect file type');
        }

        if (!type) {
            throw new BadRequestException('Unknown file type');
        }

        if (type.mime === 'image/svg+xml') {
            throw new BadRequestException('SVG is not allowed');
        }

        if (!this.allowedImageTypes.has(type.mime)) {
            throw new BadRequestException('Invalid image type');
        }

        const image = sharp(filePath, {
            limitInputPixels: MAX_PIXELS,
            failOn: 'error',
        });

        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new BadRequestException('Invalid image');
        }

        if (
            metadata.width > MAX_WIDTH ||
            metadata.height > MAX_HEIGHT ||
            metadata.width * metadata.height > MAX_PIXELS
        ) {
            throw new BadRequestException('Image too large');
        }

        return {
            image,
            metadata,
            mime: type.mime,
        };
    }
}