# 🌾 Raízes do Nordeste — API REST

API REST para gestão da rede "Raízes do Nordeste", desenvolvida para o Projeto Multidisciplinar da Trilha Back-End (UNINTER, 2026).

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 16+
- npm

## 🚀 Instalação

```bash
# Clone o repositório
cd raizes-do-nordeste

# Instale as dependências
npm install

# Configure o arquivo .env com suas credenciais
cp .env.example .env

# Execute as migrations
npx prisma migrate dev

# Popule o banco com dados de teste
npx tsx prisma/seed.ts

# Inicie o servidor
npm run dev
```

## 🔑 Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@raizes.com | Admin@123 |
| Operador Centro | operador.centro@raizes.com | Operador@123 |
| Cliente | cliente1@email.com | Cliente@123 |

---

# 🛡️ Arquitetura, Segurança e Decisões Técnicas

Este projeto foi desenvolvido seguindo padrões rigorosos de engenharia de software para ambiente corporativo, visando atender aos requisitos funcionais e não funcionais da Rede Raízes do Nordeste (Diretrizes UNINTER 2026).

## 1. Tratamento de Concorrência e Consistência (Locking Pessimista)

Para mitigar o risco de condições de corrida (*Race Conditions*) no fluxo crítico de `POST /pedidos` — cenário comum onde múltiplos usuários tentam comprar o último item em estoque de uma mesma unidade física simultaneamente —, foi implementado o **Locking Pessimista** (`SELECT ... FOR UPDATE`).

- **Mecânica:** Durante a abertura da transação isolada do banco de dados, o registro do estoque da combinação `Produto + Unidade` é bloqueado para leitura/escrita por outros processos até que a transação atual seja consolidada (`COMMIT`) ou revertida (`ROLLBACK`). Isso impede a ocorrência de "vendas fantasmas" ou saldos negativos de estoque.

## 2. Conformidade com a LGPD e Segurança de Dados (OWASP Top 10)

- **Minimização e Mascaramento:** IDs internos sequenciais e incrementais (`1, 2, 3...`) são estritamente confinados à persistência relacional e integridade referencial interna. Toda e qualquer exposição de recursos nas rotas públicas da API utiliza identificadores únicos universais (**UUIDv4**), mitigando ataques de enumeração de dados (*IDOR - Insecure Direct Object References*).

- **Sanitização de Logs e Exceções:** O Handler Global de Erros intercepta exceções nativas de banco de dados (ex: violações de restrição do Prisma/PostgreSQL) e formata as respostas de erro em um payload limpo e padronizado. Dados pessoais identificáveis (PII) e *stacktraces* técnicos nunca são expostos em logs públicos ou respostas HTTP.

- **Criptografia:** Senhas de usuários e credenciais são tratadas com a função de dispersão criptográfica adaptativa **BCrypt** antes do armazenamento.

## 3. Idempotência no Barramento de Pagamentos

O endpoint de integração simulada (`POST /api/pagamentos/mock`) foi projetado sob o princípio da **idempotência**. Requisições duplicadas ou repetidas vindas do gateway/webhook para um pedido cujo estado já tenha sido consolidado (como `PAGO` ou `REJEITADO`) são interceptadas e respondidas de forma segura, impedindo duplicidade no estorno de estoque ou no faturamento financeiro.

## 4. Controle de Acesso Baseado em Papéis (RBAC Geográfico)

A validação dos tokens JWT impõe restrições rígidas por perfil:

- `CLIENTE`: Possui escopo limitado ao próprio histórico de compras.
- `OPERADOR`: Possui autorização vinculada estritamente à sua respectiva `unidadeId`. As listagens de pedidos barram requisições cross-unit, garantindo que um operador não visualize dados logísticos ou de clientes pertencentes a outra filial geográfica.
- `ADMINISTRADOR`: Acesso total para gestão do sistema.

## 5. Stack Tecnológico

- **Backend:** Node.js + TypeScript + Express 4
- **ORM:** Prisma 7 com adapter PostgreSQL
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Token)
- **Validação:** Zod
- **Segurança:** BCrypt, Helmet, CORS
- **Logs:** Winston com sanitização

## 6. Endpoints Principais

- `POST /api/auth/login` — Autenticação de usuários
- `GET /api/produtos` — Listagem de produtos
- `GET /api/produtos/:uuid/estoque?unidadeUuid=xxx` — Consulta de estoque
- `POST /api/pedidos` — Criação de pedido (CLIENTE)
- `GET /api/pedidos` — Listagem de pedidos (por usuário ou unidade)
- `GET /api/pedidos/:uuid` — Detalhes do pedido
- `PATCH /api/pedidos/:uuid/cancelar` — Cancelamento de pedido
- `POST /api/pagamentos/mock` — Simulação de pagamento

## 7. Regras de Negócio Implementadas

- ✅ Pedidos só podem ser criados com estoque disponível
- ✅ Estoque é bloqueado durante a transação (FOR UPDATE)
- ✅ Apenas pedidos com status `AGUARDANDO_PAGAMENTO` podem ser cancelados
- ✅ Cancelamento devolve automaticamente o estoque
- ✅ Pagamento simulado com 70% aprovação / 30% rejeição
- ✅ Operadores visualizam apenas pedidos de sua unidade
- ✅ Clientes visualizam apenas seus próprios pedidos

---

**Projeto Acadêmico UNINTER 2026 — API REST "Raízes do Nordeste"**