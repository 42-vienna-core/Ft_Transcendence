import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

export const avatarMulterOptions = {
    storage: diskStorage({
        destination: '/uploads/avatars',

        filename: (_req: Request, file: Express.Multer.File, cb) => {
            const uniqueName =
                Date.now() + '-' + Math.round(Math.random() * 1e9);

            cb(null, uniqueName + extname(file.originalname));
        },
    }),

    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    },

    fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];
        const isValid = allowedMimeTypes.includes(file.mimetype);

        // ❗ не кидаем Error — просто reject
        cb(null, isValid);
    },
};