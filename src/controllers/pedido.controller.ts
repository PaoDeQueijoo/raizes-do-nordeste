import { Router, Request, Response, NextFunction } from 'express'
import { pedidoService } from '../services/pedido.service'
import { authMiddleware } from '../middlewares/authMiddleware'
import { roleMiddleware } from '../middlewares/roleMiddleware'
import { validateMiddleware } from '../middlewares/validateMiddleware'
import { CriarPedidoInputDTO } from '../dtos/pedido.dto'

const router = Router()

router.post(
  '/pedidos',
  authMiddleware,
  roleMiddleware('CLIENTE'),
  validateMiddleware(CriarPedidoInputDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioUuid = req.usuario!.sub
      const dados = req.body
      const pedido = await pedidoService.criarPedido(usuarioUuid, dados)
      res.status(201).json(pedido)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/pedidos', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarioUuid = req.usuario!.sub
    const pedidos = await pedidoService.listarPorUsuario(usuarioUuid)
    res.status(200).json(pedidos)
  } catch (error) {
    next(error)
  }
})

router.get('/pedidos/:uuid', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarioUuid = req.usuario!.sub
    const { uuid } = req.params
    const pedido = await pedidoService.buscarPedido(usuarioUuid, uuid)
    res.status(200).json(pedido)
  } catch (error) {
    next(error)
  }
})

router.patch('/pedidos/:uuid/cancelar', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarioUuid = req.usuario!.sub
    const { uuid } = req.params
    const pedido = await pedidoService.cancelarPedido(usuarioUuid, uuid)
    res.status(200).json(pedido)
  } catch (error) {
    next(error)
  }
})

export default router