import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriaEquipamentoController } from './categoria_equipamento.controller';
import { CategoriaEquipamentoService } from './categoria_equipamento.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriaEquipamentoController],
  providers: [CategoriaEquipamentoService],
  exports: [],
})
export class CategoriaEquipamentoModule {}
