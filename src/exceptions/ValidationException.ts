import { AppError } from './AppError'

export class ValidationException extends AppError {
  constructor(message: string = 'Erro de validação', details?: any[]) {
    super('VALIDATION_ERROR', message, 422, details)
  }
}