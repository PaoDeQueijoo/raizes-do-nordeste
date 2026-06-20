import { prisma } from '../config/prisma'

export class ProdutoRepository {
  async listarTodos() {
    return prisma.produto.findMany({
      select: {
        uuid: true,
        nome: true,
        preco: true,
      },
      orderBy: {
        id: 'asc',
      },
    })
  }

  async buscarPorUuid(uuid: string) {
    return prisma.produto.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        nome: true,
        preco: true,
      },
    })
  }

  async buscarPorId(id: number) {
    return prisma.produto.findUnique({
      where: { id },
      select: {
        id: true,
        uuid: true,
        nome: true,
        preco: true,
      },
    })
  }

  async buscarEstoque(produtoId: number, unidadeId: number) {
    return prisma.estoqueUnidade.findUnique({
      where: {
        produtoId_unidadeId: {
          produtoId,
          unidadeId,
        },
      },
      select: {
        saldo: true,
      },
    })
  }
}

export const produtoRepository = new ProdutoRepository()