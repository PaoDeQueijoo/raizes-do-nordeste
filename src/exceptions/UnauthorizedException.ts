import { AppError } from './AppError'

export class UnauthorizedException extends AppError {
  constructor(message: string = 'Não autorizado', details?: any[]) {
    super('UNAUTHORIZED', message, 401, details)
  }
}