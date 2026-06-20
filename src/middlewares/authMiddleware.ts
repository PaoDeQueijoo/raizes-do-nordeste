import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'
import { verificarToken, TokenPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new UnauthorizedException('Token não fornecido')
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedException('Formato de token inválido')
  }

  const token = parts[1]

  try {
    const payload = verificarToken(token)
    req.usuario = payload
    next()
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado')
  }
}