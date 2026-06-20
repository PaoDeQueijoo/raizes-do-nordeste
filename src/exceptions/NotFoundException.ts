import { AppError } from './AppError'

export class NotFoundException extends AppError {
  constructor(message: string = 'Recurso não encontrado', details?: any[]) {
    super('NOT_FOUND', message, 404, details)
  }
}