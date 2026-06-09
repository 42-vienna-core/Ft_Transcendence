import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from './file/file.service';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { AVATAR_UPLOAD_DIR } from 'src/user/user.service';

@Injectable()
export class AvatarService {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly fileService: FileService,
    ) { }

    public async updateAvatar(userId: number, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Avatar file is required');
        }

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            await this.fileService.removeFile(file.filename);
            throw new NotFoundException('User not found');
        }

        let validated;

        try {
            validated = await this.fileService.validateImage(file.path);
        } catch (err) {
            await this.fileService.removeFile(file.filename);
            throw err;
        }

        const avatarFilename = `${randomUUID()}.webp`;
        const outputPath = join(AVATAR_UPLOAD_DIR, avatarFilename);
        
        try {
            await validated.image
                .rotate()
                .resize(200, 200, {
                    fit: 'cover',
                    withoutEnlargement: true,
                })
                .webp({
                    quality: 85,
                })
                .toFile(outputPath);
            
            console.log('[UPLOAD][PROCESSED]', outputPath);

            await this.fileService.removeFile(file.filename);
        } catch (error) {
            console.error('[UPLOAD][PROCESS ERROR]', error);

            await this.fileService.removeFile(file.filename);
            await this.fileService.removeFile(avatarFilename);
            throw new BadRequestException('Failed to process image');
        }
                
        const oldAvatar = user.avatar;
        try {
            await this.prismaService.user.update({
                where: { id: userId },
                data: { avatar: avatarFilename },
            });
        } catch (error) {
            console.error('[DB][UPDATE AVATAR ERROR]', error);

            await this.fileService.removeFile(avatarFilename);
            throw error;
        }
        if (oldAvatar) {
            await this.fileService.removeFile(oldAvatar);
        }
        
        console.log('[UPLOAD][DONE]', {
            avatar: avatarFilename,
        });

        return {
            success: true,
            avatar: `https://localhost/avatars/${avatarFilename}`,
        };
    }

    public async deleteAvatar(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const avatar = user.avatar;
        if (avatar) {
            await this.fileService.removeFile(avatar);
        }
        return { success: true };
    }
}
