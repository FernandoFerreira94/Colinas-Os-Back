import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriaEquipamento } from '@prisma/client';
import { IsUrl } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UploadService } from 'src/upload/upload.service';

class CreatePreventivaFotoDto {
  @IsUrl()
  url: string;
}
import { CreatePreventivaDto } from './dto/create-preventiva.dto';
import { UpdatePreventivaDto } from './dto/update-preventiva.dto';
import { PreventivaService } from './preventiva.service';

@UseGuards(JwtAuthGuard)
@Controller('preventiva')
export class PreventivaController {
  constructor(
    private readonly service: PreventivaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() dto: CreatePreventivaDto) {
    return this.service.create(dto);
  }

  @Get('stats')
  getStats(@Query('mes') mes?: string) {
    return this.service.getStats(mes);
  }

  @Get()
  findAll(
    @Query('status') status?,
    @Query('mes') mes?: string,
    @Query('categoria') categoria?: CategoriaEquipamento,
  ) {
    return this.service.findAll({ status, mes, categoria });
  }

  @Get('checklists')
  findAllChecklists() {
    return this.service.findAllChecklists();
  }

  @Delete('fotos/:fotoId')
  removeFoto(@Param('fotoId') fotoId: string) {
    return this.service.removeFoto(fotoId, this.uploadService);
  }

  @Post(':id/fotos')
  addFoto(@Param('id') id: string, @Body() dto: CreatePreventivaFotoDto) {
    return this.service.addFoto(id, dto.url);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePreventivaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
