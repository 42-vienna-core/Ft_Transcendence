import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const avatarMulterOptions = {
    storage: diskStorage({
        destination: '/uploads/avatars',

        filename: (_req: Request, file: Express.Multer.File, cb) => {
            cb(null, randomUUID() + extname(file.originalname));
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];
        const isValid = allowedMimeTypes.includes(file.mimetype);
        if (isValid) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Invalid file type. Only JPEG, PNG and WEBP are allowed.'), false);
        }
    },
};
