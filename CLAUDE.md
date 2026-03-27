# CLAUDE.md — Colinas Backend

## Projeto

Sistema interno do Shopping Colinas para:

- Ordem de Serviço
- Equipamentos / Ativos
- Materiais / Estoque
- Preventivas + Checklist
- Funcionários / Plantão
- Relatórios

Responsável: Evandro

---

# Stack

- NestJS + Prisma + PostgreSQL
- DTOs: class-validator + class-transformer
- Auth: JWT + Guards
- Front consome via Next.js + React Query

---

# Usuários

```ts
FuncaoUser =
  | 'ELETRICISTA'
  | 'TECNICO_REFRIGERACAO'
  | 'OFICIAL_GERAL'
  | 'LIDER'
  | 'SUPERVISOR'
  | 'ALMOXARIFE'
  | 'COORDENADOR'
  | 'GERENTE_OPERACIONAL'
```

Líder/Admin:

```ts
is_admin === true ||
  funcao in ['LIDER', 'SUPERVISOR', 'COORDENADOR', 'GERENTE_OPERACIONAL'];
```

Podem:

- Criar OS em nome de outro
- Definir técnico
- Alterar status
- Adicionar apoios

---

# Ordem de Serviço

Campos principais:

```ts
criado_por_id;
tecnico_id;
atribuido_por_id;
```

`equipamento_id` = equipamento principal.

`equipamentos_os` = demais equipamentos vinculados.

Categorias:

```ts
'Elétrica' | 'Refrigeração' | 'Civil' | 'Hidráulica' | 'Dados / TI' | 'Outros';
```

Fluxo:

```txt
ABERTA
→ EM_EXECUCAO
→ AGUARDANDO_MATERIAL
→ MATERIAL_COMPRADO
→ EM_EXECUCAO
→ AGUARDANDO_FISCALIZACAO
→ FINALIZADA
```

Fiscalização recusada:

```txt
AGUARDANDO_FISCALIZACAO → RECUSADO
```

Regras:

- `tecnico_id` obrigatório ao iniciar
- `finalizada_at` preenchido automaticamente
- Toda troca de status exige histórico
- Toda troca de status deve validar transição

---

# Histórico de Status

Nunca usar `preStatus`.

Sempre:

```ts
statusHistorico: {
  status: string;
  data: Date;
}
[];
```

---

# Equipamentos

```ts
tag_formatada = `${tag_categoria}-${num_tag.padStart(2, '0')}`;
```

Exemplos:

```txt
AC-01
QE-12
GER-03
```

- `fotos` = array de URLs S3
- Localização da OS usa o primeiro equipamento

---

# Localização

```txt
SHOPPING_COLINAS → NT | NS | PT
GREEN_TOWER → SUB | N-1 | TER | 1F-26F
ESTACIONAMENTO → EXT
```

---

# Materiais

Departamentos válidos:

```ts
SHOPPING_COLINAS;
GREEN_TOWER;
ESTACIONAMENTO;
```

Material gasto só pode ser registrado em:

```ts
EM_EXECUCAO;
AGUARDANDO_MATERIAL;
MATERIAL_COMPRADO;
```

Ao remover material gasto:

1. Estornar estoque
2. Criar movimentação `ENTRADA`

Toda movimentação de estoque deve gerar histórico.

---

# Solicitação de Compra

Fluxo:

```txt
PENDENTE → APROVADA | RECUSADA
```

Payload:

```ts
{
  status: 'APROVADA' | 'RECUSADA';
}
```

---

# Preventivas

- Criadas direto no equipamento
- Não criar via OS
- Vínculo: Equipamento ↔ Preventiva ↔ Checklist

Status:

```ts
AGENDADA;
EM_EXECUCAO;
FINALIZADA;
ATRASADA;
```

Prioridade atual do projeto 🚧

1. CRUD preventivas
2. Checklist + respostas
3. Preventivas vencidas

---

# Convenções NestJS

```txt
src/modulo/
  modulo.controller.ts
  modulo.service.ts
  modulo.module.ts
  dto/
```

Regras:

- `findOne` antes de update/delete
- `PartialType` no UpdateDto
- Rotas específicas antes de `/:id`
- Sempre usar `include` nas relações necessárias
- Nunca usar `db push` em produção
- Sempre usar migration

Exceções:

```ts
NotFoundException;
ConflictException;
BadRequestException;
ForbiddenException;
```

---

# Auth

```ts
@UseGuards(JwtAuthGuard)
```

Público:

```ts
@Public()
```

Roles:

```ts
@Roles('ADMIN', 'LIDER')
```

---

# Módulos Existentes

Status aproximado:

```txt
OS           ~95%
Materiais    ~95%
Configuração ~90%
Preventivas  ~60%
Relatórios   ~10%
```

Próximas tasks:

1. GET OS com filtros
2. Detalhe da OS
3. Fluxo completo de status
4. Solicitação de compra
5. Preventivas
6. Checklist
7. Upload S3
8. Relatórios

---

# Regras Finais

- Não quebrar endpoints existentes
- Nunca retornar senha/token
- Não duplicar lógica já existente
- Sempre verificar hooks, services e DTOs antes de criar novos
- Respostas objetivas, sem boilerplate desnecessário
