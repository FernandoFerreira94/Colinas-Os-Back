import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { SolicitacoesCompraController } from './solicitacoes-compra.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MaterialService } from './material.service';

@Module({
  imports: [PrismaModule],
  providers: [MaterialService],
  controllers: [MaterialController, SolicitacoesCompraController],
})
export class MaterialModule {}
