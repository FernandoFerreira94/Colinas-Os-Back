import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { StorageClient } from '@supabase/storage-js';
import { extname } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  private readonly storage: StorageClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new InternalServerErrorException(
        'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.',
      );
    }

    this.storage = new StorageClient(`${url}/storage/v1`, {
      apikey: key,
      Authorization: `Bearer ${key}`,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
  ): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato inválido. Envie JPEG, PNG ou WebP.',
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('Arquivo excede o limite de 5 MB.');
    }

    const ext = extname(file.originalname).toLowerCase();
    const fileName = `${folder}/${randomUUID()}${ext}`;

    const { error } = await this.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao enviar arquivo: ${error.message}`,
      );
    }

    const { data } = this.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.storage.from(bucket).remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao remover arquivo: ${error.message}`,
      );
    }
  }

  extractPathFromUrl(publicUrl: string, bucket: string): string {
    const url = process.env.SUPABASE_URL!;
    const prefix = `${url}/storage/v1/object/public/${bucket}/`;
    return publicUrl.replace(prefix, '');
  }
}
