import { prisma } from '../config/prisma'
import { pedidoRepository } from '../repositories/pedido.repository'
import { estoqueRepository } from '../repositories/estoque.repository'
import { NotFoundException } from '../exceptions/NotFoundException'
import { ValidationException } from '../exceptions/ValidationException'
import { PagamentoOutput } from '../dtos/pagamento.dto'

export class PagamentoService {
  async mock(usuarioUuid: string, pedidoUuid: string): Promise<PagamentoOutput> {
    const pedido = await pedidoRepository.buscarPorUuid(pedidoUuid)
    
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado')
    }

    // Verificar se o pedido pertence ao usuário
    if (pedido.usuario.uuid !== usuarioUuid) {
      throw new NotFoundException('Pedido não encontrado')
    }

    // Verificar se está AGUARDANDO_PAGAMENTO
    if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
      // Idempotente: se já processado, retornar status atual
      return {
        pedidoUuid,
        status: pedido.status,
        mensagem: `Pedido já processado com status: ${pedido.status}`,
      }
    }

    // Sorteio: 70% PAGO, 30% REJEITADO
    const aprovado = Math.random() < 0.7

    if (aprovado) {
      // Pagamento aprovado
      await pedidoRepository.atualizarStatus(pedido.id, 'PAGO')
      
      return {
        pedidoUuid,
        status: 'PAGO',
        mensagem: 'Pagamento aprovado com sucesso',
      }
    } else {
      // Pagamento rejeitado - devolver estoque
      await prisma.$transaction(async (tx) => {
        await pedidoRepository.atualizarStatus(pedido.id, 'CANCELADO')

        for (const item of pedido.itens) {
          await estoqueRepository.devolverEstoque(
            item.produto.id,
            pedido.unidade.id,
            item.quantidade,
            tx
          )
        }
      })

      return {
        pedidoUuid,
        status: 'REJEITADO',
        mensagem: 'Pagamento rejeitado. Pedido cancelado e estoque devolvido.',
      }
    }
  }
}

export const pagamentoService = new PagamentoService()