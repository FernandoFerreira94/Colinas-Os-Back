# CCG Workflow — OBRIGATÓRIO

> **PRIORIDADE MÁXIMA:** Claude NUNCA executa código de backend diretamente.
> Toda tarefa de backend deve ser delegada ao **Codex** via `/ccg:backend`.

---

# Stack

NestJS · Prisma · PostgreSQL · class-validator · class-transformer · JWT Guards · Supabase (DB + Storage)

---

# Roles

`ELETRICISTA | TECNICO_REFRIGERACAO | OFICIAL_GERAL | LIDER | SUPERVISOR | ALMOXARIFE | COORDENADOR | GERENTE_OPERACIONAL`

- Admin: `is_admin === true || funcao in [LIDER, SUPERVISOR, COORDENADOR, GERENTE_OPERACIONAL]`
- `is_almoxarifado`: estoque, entrada/saída, notificações
- `funcao` vem no JWT — mudança de permissão exige re-login

---

# OS

Campos: `criado_por_id · tecnico_id · atribuido_por_id · equipamento_id (principal) · equipamentos_os`

Fluxo: `ABERTA → EM_EXECUCAO → AGUARDANDO_MATERIAL → MATERIAL_COMPRADO → EM_EXECUCAO → AGUARDANDO_FISCALIZACAO → FINALIZADA`

Reprovado: `AGUARDANDO_FISCALIZACAO → RECUSADO`

Regras:
- `tecnico_id` obrigatório ao iniciar
- `finalizada_at` automático ao finalizar
- `os_finalizadas += 1` só em quem finalizou (não apoios)
- Toda troca valida transição e gera `OsHistorico`

---

# Equipamentos

`tag_formatada = ${tag_categoria}-${num_tag.padStart(2,'0')}` · fotos = URLs Supabase Storage

---

# Localização

`SHOPPING_COLINAS` (NT/NS/PT) · `GREEN_TOWER` (SUB/N-1/TER/1F–26F) · `ESTACIONAMENTO` (EXT)

---

# Materiais

- Paginação obrigatória: `?page=1&limit=10`
- `notificacao_ativa: Boolean @default(true)` — se `false`, exclui da query estoque baixo
- Gasto só em: `EM_EXECUCAO | AGUARDANDO_MATERIAL | MATERIAL_COMPRADO`
- Ao remover gasto: estornar estoque + `MovimentacaoEstoque` ENTRADA + histórico
- Guard `is_almoxarifado` em entrada/saída · registrar `MovimentacaoEstoque`

Solicitação de compra: `PENDENTE → APROVADA | RECUSADA`

---

# Preventivas

Criadas no equipamento (nunca via OS) · `Equipamento ↔ Preventiva ↔ Checklist`

Status: `AGENDADA | EM_EXECUCAO | FINALIZADA | ATRASADA`

---

# Upload / Supabase Storage

Rota: `POST /upload?bucket=<bucket>` — multipart/form-data, campo `"file"`. Retorna `{ url: string }`.

Buckets: `equipamentos | materiais | os-fotos | preventivas`

Endpoints de foto implementados:
- `PATCH /materiais/:id/foto` — salva `foto_url` no Material
- `POST /ordem-servico/:id/fotos` — cria `OsFoto` (`url`, `contexto: ContextoFoto`)
- `DELETE /ordem-servico/fotos/:fotoId` — deleta do storage + DB
- `POST /preventiva/:id/fotos` — cria `PreventivaFoto` (`url`)

---

# Convenções NestJS

- Estrutura: `src/modulo/{controller,service,module,dto/}`
- `findOne` antes de update/delete · `PartialType` no UpdateDto
- Rotas específicas antes de `/:id` · sempre retornar com includes
- DTOs mapeados explicitamente — nunca direto ao Prisma `data`
- Nunca `db push` em produção — sempre migration
- Exceptions: `NotFoundException | ConflictException | BadRequestException | ForbiddenException`
- Auth: `@UseGuards(JwtAuthGuard)` · público: `@Public()` · roles: `@Roles()`

---

# Regras Finais

- TS estrito — nunca `any`
- Não quebrar endpoints existentes
- Nunca retornar senha/token
- Verificar services e DTOs antes de criar novos
