import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

export const avatarMulterOptions = {
    storage: diskStorage({
        destination: '/uploads/avatars',

        filename: (_req: Request, file: Express.Multer.File, cb) => {
            const safeExt = extname(file.originalname).toLowerCase();
            if (!safeExt) {
                return cb(new BadRequestException('File extension required'), '',
                );
            }
            if (safeExt === '.svg' || safeExt === '.html' || safeExt === '.js') {
                return cb(new BadRequestException('Forbidden file extension'), '');
            }
            const name = `${randomUUID()}${safeExt}`;
            cb(null, name);
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
        fieldSize: 1024,
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
        const isValid = allowedMimeTypes.includes(file.mimetype);
        if (!isValid) {
            return cb(
                new BadRequestException(`Invalid mime type: ${file.mimetype}`),
                false,
            );
        }
        cb(null, true);
    },
};
