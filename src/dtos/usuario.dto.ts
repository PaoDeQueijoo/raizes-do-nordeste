import { z } from 'zod'

export const UsuarioOutputDTO = z.object({
  uuid: z.string(),
  nome: z.string(),
  email: z.string().email(),
  cpf: z.string(),
  role: z.string(),
  unidadeId: z.number().optional(),
})

export const CriarUsuarioInputDTO = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['CLIENTE', 'ADMINISTRADOR', 'OPERADOR']).optional(),
  unidadeId: z.number().optional(),
})

export type UsuarioOutput = z.infer<typeof UsuarioOutputDTO>
export type CriarUsuarioInput = z.infer<typeof CriarUsuarioInputDTO>