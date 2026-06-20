import { AppError } from './AppError'

export class ForbiddenException extends AppError {
  constructor(message: string = 'Acesso negado', details?: any[]) {
    super('FORBIDDEN', message, 403, details)
  }
}