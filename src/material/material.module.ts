import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MaterialService } from './material.service';

@Module({
  imports: [PrismaModule],
  providers: [MaterialService],
  controllers: [MaterialController],
})
export class MaterialModule {}
