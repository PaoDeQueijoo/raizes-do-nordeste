import { Request, Response, NextFunction } from 'express'
import { ForbiddenException } from '../exceptions/ForbiddenException'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'

export function roleMiddleware(...rolesPermitidas: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new UnauthorizedException('Usuário não autenticado')
    }

    const temPermissao = req.usuario.roles.some(role => 
      rolesPermitidas.includes(role)
    )

    if (!temPermissao) {
      throw new ForbiddenException('Acesso negado: permissão insuficiente')
    }

    next()
  }
}