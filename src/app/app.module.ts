import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/_users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriaEquipamentoModule } from 'src/categoria_equipamento/categoria_equipamento.module';
import { EquipamentoModule } from 'src/equipamento/equipamento.module';
import { CategoriaMaterialModule } from 'src/categoria_material/categoria_material.module';
import { MaterialModule } from 'src/material/material.module';
import { LocalizacaoModule } from 'src/localizacao/localizacao.module';
import { EmpresasTerceirizadasModule } from 'src/empresas-terceirizadas/empresas-terceirizadas.module';
import { OrdemServicoModule } from 'src/ordem-servico/ordem-servico.module';
import { MateriaisGastosModule } from 'src/materiais-gastos/materiais-gastos.module';
import { PreventivaModule } from 'src/preventiva/preventiva.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CategoriaEquipamentoModule,
    EquipamentoModule,
    CategoriaMaterialModule,
    MaterialModule,
    LocalizacaoModule,
    EmpresasTerceirizadasModule,
    OrdemServicoModule,
    MateriaisGastosModule,
    PreventivaModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
