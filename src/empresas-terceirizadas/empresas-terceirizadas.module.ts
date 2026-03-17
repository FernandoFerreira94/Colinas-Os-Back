import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmpresasTerceirizadasController } from './empresas-terceirizadas.controller';
import { EmpresasTerceirizadasService } from './empresas-terceirizadas.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmpresasTerceirizadasController],
  providers: [EmpresasTerceirizadasService],
})
export class EmpresasTerceirizadasModule {}
