import { Router, Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { validateMiddleware } from '../middlewares/validateMiddleware'
import { LoginInputDTO } from '../dtos/auth.dto'

const router = Router()

router.post(
  '/auth/login',
  validateMiddleware(LoginInputDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, senha } = req.body
      const resultado = await authService.login(email, senha)
      res.status(200).json(resultado)
    } catch (error) {
      next(error)
    }
  }
)

export default router