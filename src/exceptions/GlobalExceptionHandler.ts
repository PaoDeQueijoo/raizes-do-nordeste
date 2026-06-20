import { Request, Response, NextFunction } from 'express'
import { AppError } from './AppError'
import { sanitizeForLog } from '../utils/sanitize'
import { env } from '../config/env'

export function globalExceptionHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString()
  const path = req.method + ' ' + req.path

  // Log do erro (sanitizado)
  const logData = {
    error: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    body: sanitizeForLog(req.body),
    params: sanitizeForLog(req.params),
    query: sanitizeForLog(req.query),
    path,
    timestamp,
  }
  console.error('[ERROR]', JSON.stringify(logData, null, 2))

  // Se for AppError, retornar dados normalizados
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.details,
      timestamp,
      path,
    })
    return
  }

  // Erro de banco de dados - não expor detalhes
  if (err.message.includes('Prisma') || err.message.includes('database')) {
    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: 'Erro interno do servidor',
      details: [],
      timestamp,
      path,
    })
    return
  }

  // Erro desconhecido
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor',
    details: env.NODE_ENV === 'development' ? [err.message] : [],
    timestamp,
    path,
  })
}