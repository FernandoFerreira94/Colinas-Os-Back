import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
import { PreventivaController } from './preventiva.controller';
import { PreventivaService } from './preventiva.service';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [PreventivaController],
  providers: [PreventivaService],
  exports: [PreventivaService],
})
export class PreventivaModule {}
