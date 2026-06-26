import { Router, Request, Response, NextFunction } from 'express'
import { pagamentoService } from '../services/pagamento.service'
import { authMiddleware } from '../middlewares/authMiddleware'
import { roleMiddleware } from '../middlewares/roleMiddleware'
import { validateMiddleware } from '../middlewares/validateMiddleware'
import { MockPagamentoInputDTO } from '../dtos/pagamento.dto'

const router = Router()

router.post(
  '/pagamentos/mock',
  authMiddleware,
  roleMiddleware('CLIENTE'),
  validateMiddleware(MockPagamentoInputDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioUuid = req.usuario!.sub
      const { pedidoUuid } = req.body
      const resultado = await pagamentoService.mock(usuarioUuid, pedidoUuid)
      res.status(200).json(resultado)
    } catch (error) {
      next(error)
    }
  }
)

export default router