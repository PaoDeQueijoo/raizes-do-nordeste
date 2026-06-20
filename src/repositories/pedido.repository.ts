import { Prisma, StatusPedido } from '@prisma/client'
import { prisma } from '../config/prisma'

export class PedidoRepository {
  async criarComTransacao(dados: {
    usuarioId: number
    unidadeId: number
    itens: Array<{ produtoId: number; quantidade: number; precoUnitario: number }>
    total: number
  }) {
    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          usuarioId: dados.usuarioId,
          unidadeId: dados.unidadeId,
          total: dados.total,
          status: 'AGUARDANDO_PAGAMENTO',
        },
        select: {
          id: true,
          uuid: true,
          status: true,
          total: true,
          usuarioId: true,
          unidadeId: true,
          createdAt: true,
        },
      })

      await tx.itemPedido.createMany({
        data: dados.itens.map((item) => ({
          pedidoId: pedido.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      })

      return pedido
    })
  }

  async buscarPorUuid(uuid: string) {
    return prisma.pedido.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        status: true,
        total: true,
        usuarioId: true,
        unidadeId: true,
        createdAt: true,
        usuario: {
          select: {
            uuid: true,
            nome: true,
            email: true,
          },
        },
        unidade: {
          select: {
            id: true,
            uuid: true,
            nome: true,
          },
        },
        itens: {
          select: {
            id: true,
            quantidade: true,
            precoUnitario: true,
            produto: {
              select: {
                id: true,
                uuid: true,
                nome: true,
              },
            },
          },
        },
      },
    })
  }

  async buscarPorUuidCompleto(uuid: string) {
    return prisma.pedido.findUnique({
      where: { uuid },
      include: {
        itens: {
          select: {
            produtoId: true,
            quantidade: true,
            precoUnitario: true,
            produto: {
              select: {
                uuid: true,
                nome: true,
              },
            },
          },
        },
      },
    })
  }

  async buscarPorUsuario(usuarioId: number) {
    return prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        unidade: {
          select: {
            uuid: true,
            nome: true,
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                uuid: true,
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async buscarPorUnidade(unidadeId: number) {
    return prisma.pedido.findMany({
      where: { unidadeId },
      include: {
        usuario: {
          select: {
            uuid: true,
            nome: true,
          },
        },
        unidade: {
          select: {
            uuid: true,
            nome: true,
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                uuid: true,
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async atualizarStatus(id: number, status: StatusPedido) {
    return prisma.pedido.update({
      where: { id },
      data: { status: status },
      select: {
        uuid: true,
        status: true,
        unidadeId: true,
        usuarioId: true,
      },
    })
  }
}

export const pedidoRepository = new PedidoRepository()