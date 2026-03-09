import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import multer from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        storage: multer.diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) => {
            cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
          },
        }),
        limits: {
          fileSize: parseInt(config.get('UPLOAD_MAX_FILE_SIZE', '5242880'), 10), // 5MB
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
