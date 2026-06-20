import bcrypt from 'bcrypt'
import { gerarToken } from '../utils/jwt'
import { usuarioRepository } from '../repositories/usuario.repository'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'
import { LoginOutput } from '../dtos/auth.dto'

export class AuthService {
  async login(email: string, senha: string): Promise<LoginOutput> {
    const usuario = await usuarioRepository.buscarPorEmail(email)

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos')
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos')
    }

    const token = gerarToken({
      sub: usuario.uuid,
      roles: [usuario.role],
      unidadeId: usuario.unidadeId || undefined,
    })

    return {
      token,
      usuario: {
        uuid: usuario.uuid,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    }
  }
}

export const authService = new AuthService()