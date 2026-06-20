import { z } from 'zod'

export const ItemPedidoInputDTO = z.object({
  produtoId: z.number().positive('produtoId deve ser positivo'),
  quantidade: z.number().int().positive('quantidade deve ser positiva'),
})

export const CriarPedidoInputDTO = z.object({
  unidadeUuid: z.string().uuid('unidadeUuid inválido'),
  itens: z.array(ItemPedidoInputDTO).min(1, 'Pedido deve ter pelo menos um item'),
})

export const ItemPedidoOutputDTO = z.object({
  produtoUuid: z.string(),
  nome: z.string(),
  quantidade: z.number(),
  precoUnitario: z.number(),
})

export const PedidoOutputDTO = z.object({
  uuid: z.string(),
  status: z.string(),
  total: z.number(),
  unidadeUuid: z.string(),
  itens: z.array(ItemPedidoOutputDTO),
  createdAt: z.string().datetime(),
})

export type ItemPedidoInput = z.infer<typeof ItemPedidoInputDTO>
export type CriarPedidoInput = z.infer<typeof CriarPedidoInputDTO>
export type ItemPedidoOutput = z.infer<typeof ItemPedidoOutputDTO>
export type PedidoOutput = z.infer<typeof PedidoOutputDTO>