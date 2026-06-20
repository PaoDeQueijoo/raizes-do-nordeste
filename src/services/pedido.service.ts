import { prisma } from '../config/prisma'
import { usuarioRepository } from '../repositories/usuario.repository'
import { unidadeRepository } from '../repositories/unidade.repository'
import { produtoRepository } from '../repositories/produto.repository'
import { pedidoRepository } from '../repositories/pedido.repository'
import { estoqueRepository } from '../repositories/estoque.repository'
import { NotFoundException } from '../exceptions/NotFoundException'
import { ForbiddenException } from '../exceptions/ForbiddenException'
import { ValidationException } from '../exceptions/ValidationException'
import { PedidoOutput, CriarPedidoInput } from '../dtos/pedido.dto'

interface ItemComPreco {
  produtoId: number
  quantidade: number
  precoUnitario: number
}

export class PedidoService {
  async criarPedido(usuarioUuid: string, dados: CriarPedidoInput): Promise<PedidoOutput> {
    // Buscar usuário completo (com id interno)
    const usuario = await usuarioRepository.buscarPorUuidCompleto(usuarioUuid)
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado')
    }

    // Buscar unidade completa (com id interno)
    const unidade = await unidadeRepository.buscarPorUuidCompleto(dados.unidadeUuid)
    if (!unidade) {
      throw new NotFoundException('Unidade não encontrada')
    }

    // Ordenar itens por produtoId para evitar deadlock
    const itensOrdenados = [...dados.itens].sort((a, b) => a.produtoId - b.produtoId)

    // Buscar produtos e calcular total
    let total = 0
    const itensComPreco: ItemComPreco[] = []

    for (const item of itensOrdenados) {
      const produto = await produtoRepository.buscarPorId(item.produtoId)
      if (!produto) {
        throw new NotFoundException(`Produto ${item.produtoId} não encontrado`)
      }

      const precoUnitario = Number(produto.preco)
      total += precoUnitario * item.quantidade

      itensComPreco.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario,
      })
    }

    // Arredondar total para 2 casas decimais
    total = Math.round(total * 100) / 100

    // Criar pedido em transação com SELECT ... FOR UPDATE
    const pedidoCriado = await prisma.$transaction(async (tx) => {
      // SELECT ... FOR UPDATE com parâmetros seguros (previne SQL Injection)
      for (const item of itensComPreco) {
        await tx.$queryRawUnsafe(
          'SELECT * FROM "estoque_unidade" WHERE "produtoId" = $1 AND "unidadeId" = $2 FOR UPDATE',
          item.produtoId,
          unidade.id
        )
      }

      // Verificar e debitar estoque
      for (const item of itensComPreco) {
        const saldoAtual = await tx.estoqueUnidade.findUnique({
          where: {
            produtoId_unidadeId: {
              produtoId: item.produtoId,
              unidadeId: unidade.id,
            },
          },
          select: { saldo: true },
        })

        if (!saldoAtual || saldoAtual.saldo < item.quantidade) {
          throw new ValidationException(
            `Estoque insuficiente para o produto ${item.produtoId}`,
            [{ produtoId: item.produtoId, saldoDisponivel: saldoAtual?.saldo ?? 0, quantidadeSolicitada: item.quantidade }]
          )
        }

        await tx.estoqueUnidade.update({
          where: {
            produtoId_unidadeId: {
              produtoId: item.produtoId,
              unidadeId: unidade.id,
            },
          },
          data: { saldo: { decrement: item.quantidade } },
        })
      }

      // Criar pedido com itens
      const pedido = await tx.pedido.create({
        data: {
          usuarioId: usuario.id,
          unidadeId: unidade.id,
          total,
          status: 'AGUARDANDO_PAGAMENTO',
          itens: {
            createMany: {
              data: itensComPreco.map((item) => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
              })),
            },
          },
        },
        select: { uuid: true },
      })

      return pedido
    })

    // Buscar pedido completo para retornar
    const pedidoCompleto = await pedidoRepository.buscarPorUuid(pedidoCriado.uuid)
    if (!pedidoCompleto) {
      throw new NotFoundException('Pedido criado mas não encontrado')
    }

    return this.mapearParaPedidoOutput(pedidoCompleto)
  }

  async buscarPedido(usuarioUuid: string, pedidoUuid: string): Promise<PedidoOutput> {
    const usuario = await usuarioRepository.buscarPorUuid(usuarioUuid)
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const pedido = await pedidoRepository.buscarPorUuid(pedidoUuid)
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado')
    }

    // CLIENTE: só vê o próprio pedido
    if (usuario.role === 'CLIENTE' && pedido.usuario.uuid !== usuarioUuid) {
      throw new ForbiddenException('Acesso negado: pedido não pertence ao usuário')
    }

    // OPERADOR: só vê pedidos da própria unidade
    if (usuario.role === 'OPERADOR') {
      const unidade = await unidadeRepository.buscarPorUuidCompleto(usuario.unidadeId?.toString() || '')
      if (!unidade || pedido.unidade.uuid !== unidade.uuid) {
        throw new ForbiddenException('Acesso negado: pedido não pertence à unidade do operador')
      }
    }

    return this.mapearParaPedidoOutput(pedido)
  }

  async listarPorUsuario(usuarioUuid: string): Promise<PedidoOutput[]> {
    const usuario = await usuarioRepository.buscarPorUuidCompleto(usuarioUuid)
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado')
    }

    let pedidos: any[]

    if (usuario.role === 'OPERADOR') {
      // OPERADOR: vê todos os pedidos da sua unidade
      if (!usuario.unidadeId) {
        throw new ForbiddenException('Operador não está vinculado a uma unidade')
      }
      pedidos = await pedidoRepository.buscarPorUnidade(usuario.unidadeId)
    } else {
      // CLIENTE e ADMIN: veem seus próprios pedidos
      pedidos = await pedidoRepository.buscarPorUsuario(usuario.id)
    }

    return pedidos.map(pedido => this.mapearParaPedidoOutput(pedido))
  }

  async cancelarPedido(usuarioUuid: string, pedidoUuid: string): Promise<PedidoOutput> {
    const usuario = await usuarioRepository.buscarPorUuidCompleto(usuarioUuid)
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const pedido = await pedidoRepository.buscarPorUuidCompleto(pedidoUuid)
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado')
    }

    // Verificar se o pedido pertence ao usuário
    if (pedido.usuarioId !== usuario.id) {
      throw new ForbiddenException('Acesso negado: pedido não pertence ao usuário')
    }

    // Verificar se está AGUARDANDO_PAGAMENTO
    if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
      throw new ValidationException('Apenas pedidos aguardando pagamento podem ser cancelados')
    }

    // Cancelar e devolver estoque
    await prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { status: 'CANCELADO' },
      })

      for (const item of pedido.itens) {
        await tx.estoqueUnidade.update({
          where: {
            produtoId_unidadeId: {
              produtoId: item.produtoId,
              unidadeId: pedido.unidadeId,
            },
          },
          data: { saldo: { increment: item.quantidade } },
        })
      }
    })

    // Buscar pedido atualizado
    const pedidoAtualizado = await pedidoRepository.buscarPorUuid(pedidoUuid)
    if (!pedidoAtualizado) {
      throw new NotFoundException('Pedido não encontrado após cancelamento')
    }

    return this.mapearParaPedidoOutput(pedidoAtualizado)
  }

  private mapearParaPedidoOutput(pedido: any): PedidoOutput {
    return {
      uuid: pedido.uuid,
      status: pedido.status,
      total: Number(pedido.total),
      unidadeUuid: pedido.unidade?.uuid || pedido.unidadeUuid,
      itens: (pedido.itens || []).map((item: any) => ({
        produtoUuid: item.produto?.uuid || item.produtoUuid,
        nome: item.produto?.nome || '',
        quantidade: item.quantidade,
        precoUnitario: Number(item.precoUnitario),
      })),
      createdAt: new Date(pedido.createdAt).toISOString(),
    }
  }
}

export const pedidoService = new PedidoService()