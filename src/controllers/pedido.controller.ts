import { Router, Request, Response } from 'express'
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
  async (req: Request, res: Response) => {
    const usuarioUuid = req.usuario!.sub
    const dados = req.body as { unidadeUuid: string; itens: Array<{ produtoId: number; quantidade: number }> }
    
    const pedido = await pedidoService.criarPedido(usuarioUuid, dados)
    res.status(201).json(pedido)
  }
)

router.get('/pedidos', authMiddleware, async (req: Request, res: Response) => {
  const usuarioUuid = req.usuario!.sub
  const pedidos = await pedidoService.listarPorUsuario(usuarioUuid)
  res.status(200).json(pedidos)
})

router.get('/pedidos/:uuid', authMiddleware, async (req: Request, res: Response) => {
  const usuarioUuid = req.usuario!.sub
  const { uuid } = req.params
  
  const pedido = await pedidoService.buscarPedido(usuarioUuid, uuid)
  res.status(200).json(pedido)
})

router.patch('/pedidos/:uuid/cancelar', authMiddleware, async (req: Request, res: Response) => {
  const usuarioUuid = req.usuario!.sub
  const { uuid } = req.params
  
  const pedido = await pedidoService.cancelarPedido(usuarioUuid, uuid)
  res.status(200).json(pedido)
})

export default router