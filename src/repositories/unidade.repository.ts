import { prisma } from '../config/prisma'

export class UnidadeRepository {
  async buscarPorUuid(uuid: string) {
    return prisma.unidade.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
      },
    })
  }

  async buscarPorUuidCompleto(uuid: string) {
    return prisma.unidade.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        nome: true,
        endereco: true,
      },
    })
  }
}

export const unidadeRepository = new UnidadeRepository()