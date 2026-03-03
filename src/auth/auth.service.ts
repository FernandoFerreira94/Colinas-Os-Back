import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(matricula: number, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        matricula,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encotrado');
    }
    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const pauload = {
      sub: user.id,
      matricula: user.matricula,
      is_admin: user.is_admin,
    };

    return {
      access_token: await this.jwt.signAsync(pauload),
      user: {
        id: user.id,
        nameFull: user.nameFull,
        matricula: user.matricula,
        funcao: user.funcao,
        is_admin: user.is_admin,
      },
    };
  }
}
