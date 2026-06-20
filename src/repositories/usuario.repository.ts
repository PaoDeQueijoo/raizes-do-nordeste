import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { CriarUsuarioInput } from '../dtos/usuario.dto'

export class UsuarioRepository {
  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        uuid: true,
        nome: true,
        email: true,
        senha: true,
        role: true,
        unidadeId: true,
      },
    })
  }

  async buscarPorUuid(uuid: string) {
    return prisma.usuario.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        nome: true,
        email: true,
        cpf: true,
        role: true,
        unidadeId: true,
      },
    })
  }

  async buscarPorUuidCompleto(uuid: string) {
    return prisma.usuario.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        nome: true,
        email: true,
        cpf: true,
        role: true,
        unidadeId: true,
        senha: true,
      },
    })
  }

  async criar(data: CriarUsuarioInput, senhaHash: string) {
    return prisma.usuario.create({
      data: {
        ...data,
        senha: senhaHash,
      },
      select: {
        uuid: true,
        nome: true,
        email: true,
        cpf: true,
        role: true,
        unidadeId: true,
      },
    })
  }
}

export const usuarioRepository = new UsuarioRepository()