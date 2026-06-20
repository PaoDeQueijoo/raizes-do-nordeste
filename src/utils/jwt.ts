import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'

export interface TokenPayload {
  sub: string
  roles: string[]
  unidadeId?: number
}

export function gerarToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function verificarToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    return payload
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado')
  }
}