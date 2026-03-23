import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MateriaisGastosController } from './materiais-gastos.controller';
import { MateriaisGastosService } from './materiais-gastos.service';

@Module({
  imports: [PrismaModule],
  controllers: [MateriaisGastosController],
  providers: [MateriaisGastosService],
})
export class MateriaisGastosModule {}
