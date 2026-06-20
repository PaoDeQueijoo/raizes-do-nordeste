import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ValidationException } from '../exceptions/ValidationException'

export function validateMiddleware<T extends z.ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.map((err: z.ZodIssue) => ({
          campo: err.path.join('.'),
          mensagem: err.message,
        }))
        throw new ValidationException('Erro de validação nos dados enviados', details)
      }
      throw error
    }
  }
}