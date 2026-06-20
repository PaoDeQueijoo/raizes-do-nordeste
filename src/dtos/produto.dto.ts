import { z } from 'zod'

export const ProdutoOutputDTO = z.object({
  uuid: z.string(),
  nome: z.string(),
  preco: z.number(),
})

export const EstoqueOutputDTO = z.object({
  produtoUuid: z.string(),
  nome: z.string(),
  preco: z.number(),
  saldo: z.number(),
})

export type ProdutoOutput = z.infer<typeof ProdutoOutputDTO>
export type EstoqueOutput = z.infer<typeof EstoqueOutputDTO>