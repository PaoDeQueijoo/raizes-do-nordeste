import { z } from 'zod'

export const LoginInputDTO = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export const LoginOutputDTO = z.object({
  token: z.string(),
  usuario: z.object({
    uuid: z.string(),
    nome: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
})

export type LoginInput = z.infer<typeof LoginInputDTO>
export type LoginOutput = z.infer<typeof LoginOutputDTO>