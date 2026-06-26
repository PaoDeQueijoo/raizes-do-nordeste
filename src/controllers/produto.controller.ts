import { Router, Request, Response, NextFunction } from 'express'
import { produtoRepository } from '../repositories/produto.repository'
import { unidadeRepository } from '../repositories/unidade.repository'
import { NotFoundException } from '../exceptions/NotFoundException'
import { EstoqueOutput } from '../dtos/produto.dto'

const router = Router()

router.get('/produtos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const produtos = await produtoRepository.listarTodos()
    res.status(200).json(produtos)
  } catch (error) {
    next(error)
  }
})

router.get('/produtos/:uuid/estoque', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uuid } = req.params
    const { unidadeUuid } = req.query

    if (!unidadeUuid || typeof unidadeUuid !== 'string') {
      next(new NotFoundException('unidadeUuid é obrigatório na query'))
      return
    }

    const produto = await produtoRepository.buscarPorUuid(uuid)
    if (!produto) {
      next(new NotFoundException('Produto não encontrado'))
      return
    }

    const unidade = await unidadeRepository.buscarPorUuid(unidadeUuid)
    if (!unidade) {
      next(new NotFoundException('Unidade não encontrada'))
      return
    }

    const estoque = await produtoRepository.buscarEstoque(produto.id, unidade.id!)

    const resultado: EstoqueOutput = {
      produtoUuid: produto.uuid,
      nome: produto.nome,
      preco: typeof produto.preco === 'number' ? produto.preco : Number(produto.preco),
      saldo: estoque?.saldo || 0,
    }

    res.status(200).json(resultado)
  } catch (error) {
    next(error)
  }
})

export default router