# CCG Workflow

1. Claude → lê este arquivo, divide em steps
2. Codex → backend (NestJS, Prisma, migrations)
3. Gemini → frontend (Next.js, Tailwind, shadcn/ui)
4. Claude → revisa e integra

---

# Stack

NestJS · Prisma · PostgreSQL · class-validator · class-transformer · JWT Guards · Supabase (DB+Storage)

# Roles

`ELETRICISTA | TECNICO_REFRIGERACAO | OFICIAL_GERAL | LIDER | SUPERVISOR | ALMOXARIFE | COORDENADOR | GERENTE_OPERACIONAL`

Lider/Admin: `is_admin === true || funcao in [LIDER, SUPERVISOR, COORDENADOR, GERENTE_OPERACIONAL]`

`is_almoxarifado`: estoque, entrada/saída, notificações

`funcao` vem no JWT — mudança de permissão exige re-login

# OS

Campos: `criado_por_id · tecnico_id · atribuido_por_id · equipamento_id (principal) · equipamentos_os`

Categorias: `Elétrica | Refrigeração | Civil | Hidráulica | Dados/TI | Outros`

Fluxo: `ABERTA → EM_EXECUCAO → AGUARDANDO_MATERIAL → MATERIAL_COMPRADO → EM_EXECUCAO → AGUARDANDO_FISCALIZACAO → FINALIZADA`

Reprovado: `AGUARDANDO_FISCALIZACAO → RECUSADO`

Regras:

- `tecnico_id` obrigatório ao iniciar
- `finalizada_at` automático ao finalizar
- Ao finalizar: `os_finalizadas += 1` só em quem finalizou (não apoios)
- Toda troca valida transição e gera `OsHistoria`
- Histórico: `{ status, data }[]` — nunca `preStatus`

# Equipamentos

`tag_formatada = ${tag_categoria}-${num_tag.padStart(2,'0')}` · fotos = URLs Supabase Storage

# Localização

`SHOPPING_COLINAS` (NT/NS/PT) · `GREEN_TOWER` (SUB/N-1/TER/1F–26F) · `ESTACIONAMENTO` (EXT)

# Materiais

- Paginação obrigatória: `?page=1&limit=10`
- `notificacao_ativa: Boolean @default(true)` — se `false`, exclui da query estoque baixo
- Gasto só em: `EM_EXECUCAO | AGUARDANDO_MATERIAL | MATERIAL_COMPRADO`
- Ao remover gasto: estornar estoque + `MovimentacaoEstoque` ENTRADA + histórico
- Entrada/saída: guard `is_almoxarifado` · registrar `MovimentacaoEstoque`
- Badge: `quantidade <= quantidade_minima AND notificacao_ativa = true`

Solicitação de compra: `PENDENTE → APROVADA | RECUSADA`

# Preventivas 🚧

Criadas no equipamento (nunca via OS) · `Equipamento ↔ Preventiva ↔ Checklist`

Status: `AGENDADA | EM_EXECUCAO | FINALIZADA | ATRASADA`

# Convenções NestJS

- Estrutura: `src/modulo/{controller,service,module,dto/}`
- `findOne` antes de update/delete · `PartialType` no UpdateDto
- Rotas específicas antes de `/:id` · sempre retornar com includes
- DTOs mapeados explicitamente — nunca direto ao Prisma `data`
- Nunca `db push` em produção — sempre migration
- Exceptions: `NotFoundException | ConflictException | BadRequestException | ForbiddenException`
- Auth: `@UseGuards(JwtAuthGuard)` · público: `@Public()` · roles: `@Roles()`

# Regras Finais

- TS estrito — nunca `any`
- Não quebrar endpoints existentes
- Nunca retornar senha/token
- Verificar services e DTOs antes de criar novos