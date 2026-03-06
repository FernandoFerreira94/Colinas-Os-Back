import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/_users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriaEquipamentoModule } from 'src/categoria_equipamento/categoria_equipamento.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, CategoriaEquipamentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
