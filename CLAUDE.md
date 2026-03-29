# Colinas — Backend

## Stack
NestJS · Prisma · PostgreSQL · class-validator · class-transformer · JWT Guards  
Front: Next.js + React Query

## Roles
`ELETRICISTA | TECNICO_REFRIGERACAO | OFICIAL_GERAL | LIDER | SUPERVISOR | ALMOXARIFE | COORDENADOR | GERENTE_OPERACIONAL`  
Líder/Admin: `is_admin === true || funcao in [LIDER, SUPERVISOR, COORDENADOR, GERENTE_OPERACIONAL]`  
Podem: criar OS em nome de outro · definir técnico · alterar status · adicionar apoios

## OS — Campos-chave
`criado_por_id` · `tecnico_id` · `atribuido_por_id`  
`equipamento_id` = principal · `equipamentos_os` = demais  
Categorias: `Elétrica | Refrigeração | Civil | Hidráulica | Dados/TI | Outros`

## OS — Fluxo
`ABERTA → EM_EXECUCAO → AGUARDANDO_MATERIAL → MATERIAL_COMPRADO → EM_EXECUCAO → AGUARDANDO_FISCALIZACAO → FINALIZADA`  
Reprovado: `AGUARDANDO_FISCALIZACAO → RECUSADO`  
Regras: `tecnico_id` obrigatório ao iniciar · `finalizada_at` automático · toda troca valida transição e gera histórico

## Histórico
Sempre `statusHistorico: { status, data }[]` — nunca `preStatus`

## Equipamentos
`tag_formatada = ${tag_categoria}-${num_tag.padStart(2,'0')}` ex: `AC-01`  
`fotos` = array URLs S3 · localização da OS = primeiro equipamento

## Localização
`SHOPPING_COLINAS (NT/NS/PT)` · `GREEN_TOWER (SUB/N-1/TER/1F–26F)` · `ESTACIONAMENTO (EXT)`

## Materiais
Departamentos: `SHOPPING_COLINAS | GREEN_TOWER | ESTACIONAMENTO`  
Gasto só em: `EM_EXECUCAO | AGUARDANDO_MATERIAL | MATERIAL_COMPRADO`  
Ao remover: estornar estoque + criar movimentação `ENTRADA` + histórico

## Solicitação de Compra
`PENDENTE → APROVADA | RECUSADA` · payload: `{ status: 'APROVADA' | 'RECUSADA' }`

## Preventivas 🚧
Criadas direto no equipamento (nunca via OS) · vínculo: Equipamento ↔ Preventiva ↔ Checklist  
Status: `AGENDADA | EM_EXECUCAO | FINALIZADA | ATRASADA`  
Prioridade: CRUD → Checklist → Vencidas

## Convenções NestJS
Estrutura: `src/modulo/{controller,service,module,dto/}`  
- `findOne` antes de update/delete · `PartialType` no UpdateDto
- Rotas específicas antes de `/:id` · sempre `include` nas relações
- Nunca `db push` em produção — sempre migration
- Exceções: `NotFoundException | ConflictException | BadRequestException | ForbiddenException`

## Auth
`@UseGuards(JwtAuthGuard)` · público: `@Public()` · roles: `@Roles('ADMIN','LIDER')`

## Status & Prioridades
| Módulo | % | Próximo |
|---|---|---|
| OS | ~95% | Filtros, detalhe, fluxo completo, solicitação compra |
| Materiais | ~95% | — |
| Configuração | ~90% | — |
| Preventivas | ~60% | Checklist, upload S3 |
| Relatórios | ~10% | Implementar |

## Regras Finais
- Não quebrar endpoints existentes
- Nunca retornar senha/token
- Verificar services e DTOs antes de criar novos
- Respostas objetivas, sem boilerplate