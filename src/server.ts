import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`)
  console.log(`📝 Ambiente: ${env.NODE_ENV}`)
  console.log(`🔗 API: http://localhost:${env.PORT}/api`)
})