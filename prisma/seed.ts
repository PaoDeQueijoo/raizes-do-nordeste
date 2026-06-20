import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Limpar dados existentes
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.estoqueUnidade.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.unidade.deleteMany()

  // Criar unidades
  const unidadeCentro = await prisma.unidade.create({
    data: {
      nome: 'Centro',
      endereco: 'Rua Principal, 100 - Centro',
    },
  })

  const unidadeZonaNorte = await prisma.unidade.create({
    data: {
      nome: 'Zona Norte',
      endereco: 'Av. Norte, 500 - Zona Norte',
    },
  })

  // Criar produtos
  const produtos = await prisma.produto.createMany({
    data: [
      { nome: 'Bolo de Rolo', preco: 45.90 },
      { nome: 'Rabanada', preco: 28.50 },
      { nome: 'Pamonha', preco: 12.00 },
      { nome: 'Canjica', preco: 15.90 },
      { nome: 'Pé de Moleque', preco: 8.50 },
    ],
  })

  const produtosCriados = await prisma.produto.findMany()

  // Criar estoque inicial para cada produto em cada unidade
  for (const produto of produtosCriados) {
    for (const unidade of [unidadeCentro, unidadeZonaNorte]) {
      await prisma.estoqueUnidade.create({
        data: {
          produtoId: produto.id,
          unidadeId: unidade.id,
          saldo: Math.floor(Math.random() * 40) + 10, // Entre 10 e 50
        },
      })
    }
  }

  // Hash das senhas
  const senhaAdmin = await bcrypt.hash('Admin@123', parseInt(process.env.BCRYPT_ROUNDS || '10'))
  const senhaOperador = await bcrypt.hash('Operador@123', parseInt(process.env.BCRYPT_ROUNDS || '10'))
  const senhaCliente = await bcrypt.hash('Cliente@123', parseInt(process.env.BCRYPT_ROUNDS || '10'))

  // Criar admin
  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@raizes.com',
      cpf: '12345678900',
      senha: senhaAdmin,
      role: 'ADMINISTRADOR',
    },
  })

  // Criar operadores (um para cada unidade)
  await prisma.usuario.create({
    data: {
      nome: 'Operador Centro',
      email: 'operador.centro@raizes.com',
      cpf: '98765432100',
      senha: senhaOperador,
      role: 'OPERADOR',
      unidadeId: unidadeCentro.id,
    },
  })

  await prisma.usuario.create({
    data: {
      nome: 'Operador Zona Norte',
      email: 'operador.norte@raizes.com',
      cpf: '98765432101',
      senha: senhaOperador,
      role: 'OPERADOR',
      unidadeId: unidadeZonaNorte.id,
    },
  })

  // Criar clientes de exemplo
  await prisma.usuario.create({
    data: {
      nome: 'Cliente Exemplo 1',
      email: 'cliente1@email.com',
      cpf: '11122233344',
      senha: senhaCliente,
      role: 'CLIENTE',
      unidadeId: unidadeCentro.id,
    },
  })

  await prisma.usuario.create({
    data: {
      nome: 'Cliente Exemplo 2',
      email: 'cliente2@email.com',
      cpf: '55566677788',
      senha: senhaCliente,
      role: 'CLIENTE',
      unidadeId: unidadeZonaNorte.id,
    },
  })

  console.log('✅ Seed executado com sucesso!')
  console.log('📦 Unidades criadas:', 2)
  console.log('🛍️  Produtos criados:', produtosCriados.length)
  console.log('👥 Usuários criados: 5 (1 admin, 2 operadores, 2 clientes)')
  console.log('📊 Estoques iniciais criados')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })