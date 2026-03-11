import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/_users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriaEquipamentoModule } from 'src/categoria_equipamento/categoria_equipamento.module';
import { EquipamentoModule } from 'src/equipamento/equipamento.module';
import { CategoriaMaterialModule } from 'src/categoria_material/categoria_material.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CategoriaEquipamentoModule,
    EquipamentoModule,
    CategoriaMaterialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
