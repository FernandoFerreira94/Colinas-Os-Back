import { Module } from '@nestjs/common';
import { LocalizacaoController } from './localizacao.controller';
import { LocalizacaoService } from './localizacao.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService],
})
export class LocalizacaoModule {}
