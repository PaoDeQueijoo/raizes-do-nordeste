import { Router, Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { validateMiddleware } from '../middlewares/validateMiddleware'
import { LoginInputDTO } from '../dtos/auth.dto'

const router = Router()

router.post(
  '/auth/login',
  validateMiddleware(LoginInputDTO),
  async (req: Request, res: Response) => {
    const { email, senha } = req.body
    const resultado = await authService.login(email, senha)
    res.status(200).json(resultado)
  }
)

export default router