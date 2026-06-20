import { z } from 'zod'

export const MockPagamentoInputDTO = z.object({
  pedidoUuid: z.string().uuid('pedidoUuid inválido'),
})

export const PagamentoOutputDTO = z.object({
  pedidoUuid: z.string(),
  status: z.string(),
  mensagem: z.string(),
})

export type MockPagamentoInput = z.infer<typeof MockPagamentoInputDTO>
export type PagamentoOutput = z.infer<typeof PagamentoOutputDTO>