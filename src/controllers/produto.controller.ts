import { Router, Request, Response } from 'express'
import { produtoRepository } from '../repositories/produto.repository'
import { unidadeRepository } from '../repositories/unidade.repository'
import { NotFoundException } from '../exceptions/NotFoundException'
import { EstoqueOutput } from '../dtos/produto.dto'

const router = Router()

router.get('/produtos', async (_req: Request, res: Response) => {
  const produtos = await produtoRepository.listarTodos()
  res.status(200).json(produtos)
})

router.get('/produtos/:uuid/estoque', async (req: Request, res: Response) => {
  const { uuid } = req.params
  const { unidadeUuid } = req.query

  if (!unidadeUuid || typeof unidadeUuid !== 'string') {
    throw new NotFoundException('unidadeUuid é obrigatório na query')
  }

  const produto = await produtoRepository.buscarPorUuid(uuid)
  if (!produto) {
    throw new NotFoundException('Produto não encontrado')
  }

  const unidade = await unidadeRepository.buscarPorUuid(unidadeUuid)
  if (!unidade) {
    throw new NotFoundException('Unidade não encontrada')
  }

  const estoque = await produtoRepository.buscarEstoque(produto.id, unidade.id!)

  const resultado: EstoqueOutput = {
    produtoUuid: produto.uuid,
    nome: produto.nome,
    preco: typeof produto.preco === 'number' ? produto.preco : Number(produto.preco),
    saldo: estoque?.saldo || 0,
  }

  res.status(200).json(resultado)
})

export default router