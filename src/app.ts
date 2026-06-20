import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { env } from './config/env'
import { globalExceptionHandler } from './exceptions/GlobalExceptionHandler'
import authRouter from './controllers/auth.controller'
import produtoRouter from './controllers/produto.controller'
import pedidoRouter from './controllers/pedido.controller'
import pagamentoRouter from './controllers/pagamento.controller'

dotenv.config()

export function createApp(): Application {
  const app = express()

  // Middlewares globais
  app.use(cors({
    origin: env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  app.use(helmet())
  app.use(express.json())

  // Rotas
  app.use('/api', authRouter)
  app.use('/api', produtoRouter)
  app.use('/api', pedidoRouter)
  app.use('/api', pagamentoRouter)

  // Handler global de erros (deve ser o último middleware)
  app.use(globalExceptionHandler)

  return app
}