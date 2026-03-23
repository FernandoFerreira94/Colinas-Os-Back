import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { MateriaisGastosService } from './materiais-gastos.service';
import { CreateMaterialGastoDto } from './dto/create-material-gasto.dto';

@UseGuards(JwtAuthGuard)
@Controller('materiais-gastos')
export class MateriaisGastosController {
  constructor(private readonly service: MateriaisGastosService) {}

  @Post()
  registrar(
    @Body() dto: CreateMaterialGastoDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.service.registrar(dto, user.sub);
  }

  @Get('os/:osId')
  findByOs(@Param('osId') osId: string) {
    return this.service.findByOs(osId);
  }
}
