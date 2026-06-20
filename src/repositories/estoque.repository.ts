import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ValidationException } from '../exceptions/ValidationException'

export class EstoqueRepository {
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

  async debitarEstoque(
    produtoId: number,
    unidadeId: number,
    quantidade: number,
    tx: Prisma.TransactionClient
  ) {
    const estoque = await tx.estoqueUnidade.findUnique({
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

    if (!estoque || estoque.saldo < quantidade) {
      throw new ValidationException('Estoque insuficiente para o produto solicitado', [
        { produtoId, unidadeId, saldoDisponivel: estoque?.saldo ?? 0, quantidadeSolicitada: quantidade },
      ])
    }

    return tx.estoqueUnidade.update({
      where: {
        produtoId_unidadeId: {
          produtoId,
          unidadeId,
        },
      },
      data: {
        saldo: {
          decrement: quantidade,
        },
      },
      select: {
        saldo: true,
      },
    })
  }

  async devolverEstoque(
    produtoId: number,
    unidadeId: number,
    quantidade: number,
    tx: Prisma.TransactionClient
  ) {
    return tx.estoqueUnidade.update({
      where: {
        produtoId_unidadeId: {
          produtoId,
          unidadeId,
        },
      },
      data: {
        saldo: {
          increment: quantidade,
        },
      },
      select: {
        saldo: true,
      },
    })
  }
}

export const estoqueRepository = new EstoqueRepository()