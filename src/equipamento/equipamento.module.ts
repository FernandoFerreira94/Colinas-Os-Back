import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EquipamentoController } from './equipamento.controller';
import { EquipamentoService } from './equipamento.service';

@Module({
  imports: [PrismaModule],
  controllers: [EquipamentoController],
  providers: [EquipamentoService],
  exports: [],
})
export class EquipamentoModule {}
