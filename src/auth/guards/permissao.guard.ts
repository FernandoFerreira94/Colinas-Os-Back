import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { FuncaoUser } from '@prisma/client';

const FUNCOES_PERMITIDAS: FuncaoUser[] = [
  FuncaoUser.LIDER,
  FuncaoUser.SUPERVISOR,
  FuncaoUser.COORDENADOR,
  FuncaoUser.GERENTE_OPERACIONAL,
];

@Injectable()
export class PermissaoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    if (
      user.is_admin ||
      FUNCOES_PERMITIDAS.includes(user.funcao as FuncaoUser)
    ) {
      return true;
    }

    throw new ForbiddenException(
      'Acesso negado. Permissão insuficiente para esta ação.',
    );
  }
}
