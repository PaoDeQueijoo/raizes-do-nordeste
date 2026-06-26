import { Request, Response, NextFunction } from 'express'
import { ForbiddenException } from '../exceptions/ForbiddenException'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'

export function roleMiddleware(...rolesPermitidas: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      next(new UnauthorizedException('Usuário não autenticado'))
      return
    }

    const temPermissao = req.usuario.roles.some(role => 
      rolesPermitidas.includes(role)
    )

    if (!temPermissao) {
      next(new ForbiddenException('Acesso negado: permissão insuficiente'))
      return
    }

    next()
  }
}
