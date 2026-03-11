import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(): Promise<User[]> {
    const usersAll = await this.prisma.user.findMany();
    return usersAll;
  }

  async finOneUsers(id) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const findUser = await this.prisma.user.findUnique({
      where: { id },
    });
    return findUser;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.prisma.user.findUnique({
      where: { matricula: createUserDto.matricula },
    });

    if (userExists) {
      throw new NotFoundException('Usuário ja cadastrado');
    }
    try {
      const defaultPàssword = createUserDto.cpf.substring(0, 6);
      console.log(defaultPàssword);
      const hashedPawword = await bcrypt.hash(defaultPàssword, 10);

      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          ativo: true,
          os_finalizadas: 0,
          os_apoio: 0,
          password: hashedPawword,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          throw new ConflictException(
            field?.includes('cpf')
              ? 'CPF já cadastrado!'
              : 'Matrícula já cadastrada!',
          );
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const data = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const update = await this.prisma.user.update({
      where: { id },
      data,
    });

    return update;
  }

  async deleteUser(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const del = await this.prisma.user.delete({
      where: { id },
    });
    return del;
  }
}
