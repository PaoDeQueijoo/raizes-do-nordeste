export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any[]

  constructor(code: string, message: string, statusCode: number, details?: any[]) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}