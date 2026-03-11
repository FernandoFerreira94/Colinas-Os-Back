import { Module } from '@nestjs/common';
import { CategoriaMaterialService } from './categoria_material.service';
import { CategoriaMaterialController } from './categoria_material.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CategoriaMaterialService],
  controllers: [CategoriaMaterialController],
})
export class CategoriaMaterialModule {}
