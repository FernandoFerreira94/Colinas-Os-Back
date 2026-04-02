import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

const VALID_BUCKETS = ['equipamentos', 'materiais', 'os-fotos', 'preventivas', 'materiais-solicitados'];

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload?bucket=os-fotos&folder=abertura
   * Retorna: { url: string }
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: string,
    @Query('folder') folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (!bucket || !VALID_BUCKETS.includes(bucket)) {
      throw new BadRequestException(
        `Bucket inválido. Valores aceitos: ${VALID_BUCKETS.join(', ')}.`,
      );
    }

    const resolvedFolder = folder ?? 'geral';

    const url = await this.uploadService.uploadFile(
      file,
      bucket,
      resolvedFolder,
    );

    return { url };
  }
}
