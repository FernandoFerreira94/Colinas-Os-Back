# CLAUDE.md — Colinas Gestão de Ativos e Ordem de Serviço

> Leia este arquivo completamente antes de qualquer tarefa.
> Atualizado em: Março 2026

---

## 1. Visão Geral do Projeto

**Nome:** Colinas — Gestão de Ativos e Ordem de Serviço
**Cliente:** Shopping Colinas
**Responsável:** Evandro (Gerente de Operações)

**Objetivo:** Sistema interno de gestão para o complexo Shopping Colinas cobrindo:

- Ordem de Serviço com controle de status, técnicos e materiais
- Manutenção preventiva com checklist por tipo de equipamento
- Controle de ativos (equipamentos do complexo)
- Almoxarifado: estoque, entrada/saída, solicitação de compra
- Gestão de funcionários e turnos
- Relatórios de produtividade e consumo de material

---

## 2. Stack Tecnológica

| Camada         | Tecnologia                             |
| -------------- | -------------------------------------- |
| Frontend       | Next.js, React, TailwindCSS, shadcn/ui |
| Formulários    | React Hook Form + Zod                  |
| Requisições    | React Query (cache + estado servidor)  |
| Backend        | NestJS (Node.js)                       |
| Banco de dados | PostgreSQL                             |
| ORM            | Prisma                                 |
| Deploy         | AWS                                    |
| Validação DTOs | class-validator + class-transformer    |
| Notificações   | sileo (padrão do projeto)              |

---

## 3. Complexo — Estrutura de Localização

```
SHOPPING_COLINAS (enum: SHOPPING_COLINAS)
├── NT — Nível Térreo
├── NS — Nível Superior
└── PT — Piso Técnico

ESTACIONAMENTO (enum: ESTACIONAMENTO)
└── EXT — Externo
    áreas: Pátio A, Pátio B, Pista de Rolagem, Cinema,
           Espaço Vanguarda, Portaria 1-4

GREEN_TOWER (enum: GREEN_TOWER)
├── SUB — Subsolo
├── N-1 — Nível -1 (acesso, mesmo nível NT do shop)
├── TER — Térreo / Recepção (mesmo nível NS do shop)
├── 1F  — 1º Andar (Eventos)
└── 2F ao 26F — Andares
```

---

## 4. Perfis de Usuário

```typescript
enum FuncaoUser {
  ELETRICISTA
  TECNICO_REFRIGERACAO
  OFICIAL_GERAL
  LIDER
  SUPERVISOR
  ALMOXARIFE
  COORDENADOR
  GERENTE_OPERACIONAL
}
```

- `is_admin` — acesso administrativo completo
- `is_almoxarife` — acesso ao módulo de almoxarifado
- **Líderes e Admins** podem operar o sistema em nome de outros funcionários

---

## 5. Módulos e Status

| Módulo                            | Back | Front     | %    |
| --------------------------------- | ---- | --------- | ---- |
| Auth / Login                      | ✅   | ✅        | 100% |
| User Profile                      | ✅   | ✅        | 100% |
| Funcionários                      | ✅   | ✅        | 100% |
| Equipamentos                      | ✅   | ✅        | 95%  |
| Localização                       | ✅   | ✅        | 100% |
| Empresas Terceirizadas            | ✅   | ✅        | 100% |
| Ordem de Serviço (criar)          | ✅   | ✅        | 80%  |
| Ordem de Serviço (listar/detalhe) | 🔲   | 🔲        | 0%   |
| Ordem de Serviço (fluxo status)   | ✅   | 🔲        | 30%  |
| Categoria/Subcategoria Material   | ✅   | ✅        | 100% |
| Materiais (estoque)               | 🔲   | 🔲        | 0%   |
| Preventivas                       | 🔲   | 🔲        | 0%   |
| Checklist                         | 🔲   | 🔲        | 0%   |
| Turnos / Plantão                  | 🔲   | 🔲        | 0%   |
| Upload Fotos (S3)                 | 🔲   | 🔲        | 0%   |
| Relatórios                        | 🔲   | 🔲        | 0%   |
| Dashboard                         | 🔲   | 🎨 design | 15%  |

---

## 6. Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum CategoriaEquipamento {
  Eletrica
  Refrigeracao
}

enum Unidade {
  Un
  Kg
  Mt
  Cx
  Ll
  Pc
}

enum Complexo {
  SHOPPING_COLINAS
  GREEN_TOWER
  ESTACIONAMENTO
}

enum TipoOS {
  CORRETIVA
  MELHORIA
  ACOMPANHAMENTO
  PREVENTIVA
}

enum StatusOS {
  ABERTA
  EM_EXECUCAO
  PAUSADA
  AGUARDANDO_MATERIAL
  MATERIAL_COMPRADO
  MATERIAL_RECUSADO
  AGUARDANDO_FISCALIZACAO
  RECUSADO
  FINALIZADA
}

enum Prioridade {
  BAIXA
  MEDIA
  ALTA
}

enum StatusSolicitacao {
  PENDENTE
  APROVADA
  RECUSADA
}

enum TipoItemSolicitacao {
  CADASTRADO
  NAO_CADASTRADO
}

enum TipoMovimentacao {
  ENTRADA
  SAIDA
  AJUSTE
}

enum FuncaoUser {
  ELETRICISTA
  TECNICO_REFRIGERACAO
  OFICIAL_GERAL
  LIDER
  SUPERVISOR
  ALMOXARIFE
  COORDENADOR
  GERENTE_OPERACIONAL
}

enum StatusPreventiva {
  AGENDADA
  EM_EXECUCAO
  FINALIZADA
  ATRASADA
}

enum Plantao {
  Diurno
  Noturno
  Comercial1
  Comercial2
}

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

model User {
  id               String     @id @default(uuid())
  nameFull         String
  matricula        Int        @unique
  cpf              String     @unique
  funcao           FuncaoUser
  is_admin         Boolean    @default(false)
  is_almoxarife    Boolean    @default(false)
  plantao          Plantao
  equipe           String
  ativo            Boolean    @default(true)
  date_register    DateTime
  date_termination DateTime?
  password         String
  os_finalizadas   Int        @default(0)
  os_apoio         Int        @default(0)
  created_at       DateTime   @default(now())

  ordens_responsavel OrdemServico[] @relation("TecnicoResponsavel")
  ordens_apoio       OsApoio[]
  os_criadas         OrdemServico[] @relation("OSCriadaPor")
  os_atribuidas      OrdemServico[] @relation("OSAtribuidaPor")
  historico_criado   OsHistorico[]  @relation("OSHistoricoCriadoPor")
  solicitacoes       SolicitacaoCompra[]
  materiais_gastos   MaterialGasto[] @relation("MateriaisGastosRegistradoPor")
  movimentacoes      MovimentacaoEstoque[] @relation("MovimentacoesEstoqueUsuario")
}

// ─────────────────────────────────────────
// CATEGORIA EQUIPAMENTO
// ─────────────────────────────────────────

model Categoria_Equipamento {
  id         String               @id @default(uuid())
  categoria  CategoriaEquipamento
  tag        String               @unique
  tipo       String               @unique
  created_at DateTime             @default(now())

  equipamentos Equipamentos[]
}

// ─────────────────────────────────────────
// LOCALIZAÇÃO
// ─────────────────────────────────────────

model Localizacao {
  id         String   @id @default(uuid())
  complexo   Complexo
  andar      String?
  area       String?
  created_at DateTime @default(now())

  equipamentos   Equipamentos[]
  ordens_servico OrdemServico[]
}

// ─────────────────────────────────────────
// EMPRESA TERCEIRIZADA
// ─────────────────────────────────────────

model EmpresaTerceirizada {
  id         String   @id @default(uuid())
  nome       String
  cnpj       String?  @unique
  contato    String?
  ativo      Boolean  @default(true)
  created_at DateTime @default(now())

  equipamentos   Equipamentos[]
  ordens_servico OrdemServico[]
}

// ─────────────────────────────────────────
// EQUIPAMENTOS
// ─────────────────────────────────────────

model Equipamentos {
  id               String                @id @default(uuid())
  ativo            Boolean               @default(true)
  name_equipamento String
  tag_formatada    String                @unique
  num_tag          Int
  categoria_id     String
  categoria        Categoria_Equipamento @relation(fields: [categoria_id], references: [id])
  localizacao_id   String?
  localizacao      Localizacao?          @relation(fields: [localizacao_id], references: [id])
  empresa_id       String?
  empresa          EmpresaTerceirizada?  @relation(fields: [empresa_id], references: [id])
  modelo           String?
  fabricante       String?
  local_instalacao String?
  descricao        String?
  fotos            String[]
  created_at       DateTime              @default(now())

  ordens_servico OrdemServico[]
  ordens_os      OsEquipamento[]
  preventivas    Preventiva[]
}

// ─────────────────────────────────────────
// ORDEM DE SERVIÇO
// ─────────────────────────────────────────

model OrdemServico {
  id                String               @id @default(uuid())
  codigo            String               @unique
  titulo            String
  descricao         String?
  tipo              TipoOS
  status            StatusOS             @default(ABERTA)
  prioridade        Prioridade           @default(MEDIA)
  complexo          Complexo
  localizacao_id    String?
  localizacao       Localizacao?         @relation(fields: [localizacao_id], references: [id])
  equipamento_id    String?
  equipamento       Equipamentos?        @relation(fields: [equipamento_id], references: [id])
  tecnico_id        String?
  tecnico           User?                @relation("TecnicoResponsavel", fields: [tecnico_id], references: [id])
  criado_por_id     String
  criado_por        User                 @relation("OSCriadaPor", fields: [criado_por_id], references: [id])
  empresa_id        String?
  empresa           EmpresaTerceirizada? @relation(fields: [empresa_id], references: [id])
  preventiva_id     String?
  categoria         String?
  empresa_nome      String?
  tecnico_externo   String?
  cargo_externo     String?
  fotos             String[]
  observacao_fiscal String?
  created_at        DateTime             @default(now())
  updated_at        DateTime             @updatedAt
  finalizada_at     DateTime?
  atribuido_por_id String?
  atribuido_por    User?   @relation("OSAtribuidaPor", fields: [atribuido_por_id], references: [id])

  apoios          OsApoio[]
  equipamentos_os OsEquipamento[]
  historico       OsHistorico[]
  solicitacoes    SolicitacaoCompra[]
  materiais_gastos    MaterialGasto[]
  movimentacoes       MovimentacaoEstoque[]
}

model OsHistorico {
  id             String       @id @default(uuid())
  os_id          String
  os             OrdemServico @relation(fields: [os_id], references: [id])
  descricao      String
  status_gerado  StatusOS
  recusado       Boolean      @default(false)
  criado_por_id  String
  criado_por     User         @relation("OSHistoricoCriadoPor", fields: [criado_por_id], references: [id])
  criado_em      DateTime     @default(now())
}


model OsApoio {
  id      String       @id @default(uuid())
  os_id   String
  os      OrdemServico @relation(fields: [os_id], references: [id])
  user_id String
  user    User         @relation(fields: [user_id], references: [id])

  @@unique([os_id, user_id])
}

model OsEquipamento {
  id             String       @id @default(uuid())
  os_id          String
  os             OrdemServico @relation(fields: [os_id], references: [id])
  equipamento_id String
  equipamento    Equipamentos @relation(fields: [equipamento_id], references: [id])
  created_at     DateTime     @default(now())

  @@unique([os_id, equipamento_id])
}

// ─────────────────────────────────────────
// MATERIAIS
// ─────────────────────────────────────────

model Categoria_Material {
  id            String                  @id @default(uuid())
  categoria     String                  @unique
  subCategorias SubCategoria_Material[]
}

model SubCategoria_Material {
  id           String             @id @default(uuid())
  subCategoria String
  categoria_id String
  categoria    Categoria_Material @relation(fields: [categoria_id], references: [id])
  materiais    Material[]

  @@unique([subCategoria, categoria_id])
}

model Material {
  id                 String                @id @default(uuid())
  codigo             String                @unique @db.VarChar(20)
  descricao          String
  cor                String?
  quantidade_minima  Int?
  quantidade_estoque Int                   @default(0)
  departamento       Complexo
  marca              String?
  price              Decimal               @db.Decimal(10, 2)
  unidade            Unidade
  subcategoriaId     String
  subcategoria       SubCategoria_Material @relation(fields: [subcategoriaId], references: [id])
  createdAt          DateTime              @default(now())
  updatedAt          DateTime              @updatedAt

  itens_solicitacao SolicitacaoCompraItem[]
  gastos            MaterialGasto[]
  movimentacoes     MovimentacaoEstoque[]

  @@map("materiais")
}

// ─────────────────────────────────────────
// SOLICITAÇÕES DE COMPRA
// ─────────────────────────────────────────

model SolicitacaoCompra {
  id            String            @id @default(uuid())
  os_id         String?
  os            OrdemServico?     @relation(fields: [os_id], references: [id])
  preventiva_id String?
  criado_por_id String
  criado_por    User              @relation(fields: [criado_por_id], references: [id])
  observacao    String?
  status        StatusSolicitacao @default(PENDENTE)
  criado_em     DateTime          @default(now())

  itens SolicitacaoCompraItem[]
}

model SolicitacaoCompraItem {
  id             String               @id @default(uuid())
  solicitacao_id String
  solicitacao    SolicitacaoCompra    @relation(fields: [solicitacao_id], references: [id])
  tipo           TipoItemSolicitacao
  material_id    String?
  material       Material?            @relation(fields: [material_id], references: [id])
  nome           String?
  descricao      String?
  unidade        String?
  imagem_url     String?
  quantidade     Float
}

// ─────────────────────────────────────────
// MATERIAIS GASTOS
// ─────────────────────────────────────────

model MaterialGasto {
  id                String       @id @default(uuid())
  os_id             String
  os                OrdemServico @relation(fields: [os_id], references: [id])
  material_id       String
  material          Material     @relation(fields: [material_id], references: [id])
  quantidade        Int
  registrado_por_id String
  registrado_por    User         @relation("MateriaisGastosRegistradoPor", fields: [registrado_por_id], references: [id])
  created_at        DateTime     @default(now())
}

model MovimentacaoEstoque {
  id          String           @id @default(uuid())
  material_id String
  material    Material         @relation(fields: [material_id], references: [id])
  tipo        TipoMovimentacao
  quantidade  Int
  os_id       String?
  os          OrdemServico?    @relation(fields: [os_id], references: [id])
  usuario_id  String
  usuario     User             @relation("MovimentacoesEstoqueUsuario", fields: [usuario_id], references: [id])
  descricao   String?
  created_at  DateTime         @default(now())
}

// ─────────────────────────────────────────
// PREVENTIVAS
// ─────────────────────────────────────────

model ChecklistTemplate {
  id         String          @id @default(uuid())
  nome       String
  tipo       String
  created_at DateTime        @default(now())

  itens       ChecklistItem[]
  preventivas Preventiva[]
}

model ChecklistItem {
  id          String            @id @default(uuid())
  template_id String
  template    ChecklistTemplate @relation(fields: [template_id], references: [id])
  descricao   String
  ordem       Int
  obrigatorio Boolean           @default(true)
}

model Preventiva {
  id              String            @id @default(uuid())
  equipamento_id  String
  equipamento     Equipamentos      @relation(fields: [equipamento_id], references: [id])
  checklist_id    String
  checklist       ChecklistTemplate @relation(fields: [checklist_id], references: [id])
  frequencia_dias Int
  status          StatusPreventiva  @default(AGENDADA)
  data_agendada   DateTime
  data_finalizada DateTime?
  created_at      DateTime          @default(now())
}

```

---

## 7. Fluxo de Status da OS

```
ABERTA
  → EM_EXECUCAO (tecnico_id obrigatório ao iniciar)
    → AGUARDANDO_MATERIAL
        → MATERIAL_COMPRADO   → EM_EXECUCAO
        → MATERIAL_RECUSADO   → técnico decide
    → AGUARDANDO_FISCALIZACAO
        → FINALIZADA (finalizada_at preenchido automaticamente)
```

---

## 8. Regras de Negócio Importantes

### Ordem de Serviço

- `criado_por_id` = quem registrou no sistema (pode ser Líder em nome de outro)
- `tecnico_id` = quem executa (preenchido ao iniciar ou na criação pelo Líder)
- `atribuido_por_id` = Líder/Admin que operou o sistema em nome de outro
- `equipamento_id` = equipamento PRINCIPAL (primeiro selecionado — usado para localização automática)
- `equipamentos_os` = todos os equipamentos vinculados à OS (N:N via OsApoio)
- `categoria` = categoria do serviço: "Elétrica", "Refrigeração", "Civil", "Hidráulica", "Dados / TI", "Outros"
- Preventivas NÃO são criadas via OS — são criadas direto no equipamento

### Líderes e Admins

- `is_admin === true` OU `funcao` em `['LIDER', 'SUPERVISOR', 'COORDENADOR', 'GERENTE_OPERACIONAL']`
- Podem atribuir técnico na criação da OS
- Podem operar qualquer transição de status em nome de outro funcionário
- Podem adicionar apoios

### Equipamentos

- `tag_formatada` gerada automaticamente: `${tag_categoria}-${num_tag.padStart(2, '0')}` ex: AC-01
- `fotos` = array de URLs S3 (opcional por padrão)
- Localização automática na OS: usa `localizacao` do primeiro equipamento selecionado

### Acompanhamento

- Empresa cadastrada: vinculada via `empresa_id`, filtra equipamentos pelo `empresa_id`
- Empresa avulsa: campos `empresa_nome`, `tecnico_externo`, `cargo_externo`
- Equipamentos são filtrados pela empresa quando empresa cadastrada selecionada

---

## 9. Convenções NestJS

```typescript
// Estrutura de módulo
src/nome-modulo/
  ├── nome-modulo.module.ts
  ├── nome-modulo.controller.ts
  ├── nome-modulo.service.ts
  └── dto/
      ├── create-nome-modulo.dto.ts
      └── update-nome-modulo.dto.ts

// Regras
- Sempre usar PartialType no UpdateDto
- Sempre validar existência com findOne antes de update e delete
- Sempre retornar com include das relações necessárias
- Usar NotFoundException do @nestjs/common
- Usar ConflictException para duplicidades
- Rotas específicas SEMPRE antes de /:id no controller
```

---

## 10. Convenções Frontend

```typescript
// Estrutura de hooks
src/hooks/modulo/
  ├── GET/useGetModulo.ts
  ├── POST/useCreateModulo.ts
  ├── PATCH/useUpdateModulo.ts
  └── DELETE/useDeleteModulo.ts

// Regras
- React Query para todas as requisições
- React Hook Form + Zod para formulários
- shadcn/ui + TailwindCSS para componentes
- sileo.promise para feedback de mutations
- Todos os hooks de mutation invalidam as queries corretas
- z.enum() exige arrays com "as const" — nunca "as Tipo[]"
- defaultValues com z.enum() usam undefined, nunca ""
- useIsLiderOuAdmin() para lógica de permissão no frontend
```

---

## 11. Componentes Reutilizáveis Criados

| Componente                  | Localização                | Uso                                                  |
| --------------------------- | -------------------------- | ---------------------------------------------------- |
| `SelectLocalizacao`         | components/layoute/        | Seleciona complexo + andar + área com find-or-create |
| `SelectEmpresa`             | components/layoute/        | Lista empresas ativas com opção "Nenhuma"            |
| `SelectFuncionarioEmNomeDe` | components/layoute/        | Só visível para Líder/Admin                          |
| `BadgeIniciais`             | components/layoute/        | Avatar com iniciais do nome                          |
| `StatusOsBadge`             | components/ordem-servico/  | Badge colorido por status da OS                      |
| `PrioridadeBadge`           | components/ordem-servico/  | Badge colorido por prioridade                        |
| `FiltroOrdemServico`        | components/ordem-servico/  | Filtros de status + categoria + tipo                 |
| `NovaOrdemServicoDialog`    | app/(pages)/ordem-servico/ | Dialog 3 steps para criar OS                         |
| `Step01Classificacao`       | app/(pages)/ordem-servico/ | Step 1: tipo, categoria, equipamentos                |
| `Step02Localizacao`         | app/(pages)/ordem-servico/ | Step 2: localização (auto ou manual)                 |
| `Step03Detalhes`            | app/(pages)/ordem-servico/ | Step 3: descrição e fotos                            |

---

## 12. QueryKeys Padrão

```typescript
['equipamentos']['categoria-equipamento']['categorias-equipamento'][
  'localizacoes'
]['empresas']['ordens-servico'][('ordens-servico', id)][
  ('ordens-servico', 'status', status)
][('ordens-servico', 'tipo', tipo)][('ordens-servico', 'categoria', categoria)][
  'users'
]['materiais'];
```

---

## 13. Ordem de Implementação — Próximas Tasks

1. ⏳ GET Ordem de Serviço — tabela com filtros (status + categoria + tipo)
2. ⏳ Página detalhe da OS por ID
3. ⏳ IniciarOSDialog — iniciar execução + apoios
4. ⏳ Fluxo de status: aguardando material → fiscalização → finalizar
5. ⏳ Módulo Material completo (estoque + movimentação)
6. ⏳ Solicitação de Compra vinculada à OS
7. ⏳ Preventivas (criadas direto no equipamento)
8. ⏳ Checklist templates + respostas
9. ⏳ Upload de fotos (AWS S3)
10. ⏳ Dashboard (queries agregadas)
11. ⏳ Relatórios
12. ⏳ Turnos / Plantão

## 14. Contexto do Projeto

Backend do sistema de facility management do Shopping Colinas. API REST consumida pelo frontend Next.js.

**Status atual: ~88% concluído**

| Módulo           | Status  |
| ---------------- | ------- |
| Login / Auth     | ✅ 100% |
| Dashboard        | ✅ 100% |
| Equipamentos     | ✅ 100% |
| Funcionários     | ✅ 100% |
| Plantão          | ✅ 100% |
| User             | ✅ 100% |
| Ordem de Serviço | ✅ ~95% |
| Materiais        | ✅ ~95% |
| Configuração     | 🔨 ~90% |
| Preventivas      | 🔨 ~60% |
| Relatórios       | ⏳ ~10% |

---

## 15. Stack & Dependências

```
@nestjs/core + @nestjs/common
@nestjs/jwt + @nestjs/passport  ← auth
@prisma/client + prisma
class-validator + class-transformer
bcrypt
```

---

## 16. Estrutura de Pastas

```
/src
  /auth/                  ← JWT auth, guards, decorators
  /common/
    /decorators/
    /guards/
    /interceptors/
    /filters/
    /pipes/
  /prisma/                ← PrismaService
  /ordens-de-servico/
    ordens-de-servico.controller.ts
    ordens-de-servico.service.ts
    dto/
  /equipamentos/
  /funcionarios/
  /materiais/
  /materiais-gastos/
  /solicitacoes-compra/
  /preventivas/
  /plantao/
  /relatorios/
  /configuracao/
  /user/
  /dashboard/
```

---

## 17. Padrões de Código

### Controller

```typescript
@Controller('ordens-de-servico')
@UseGuards(JwtAuthGuard)
export class OrdensDeServicoController {
  constructor(private readonly service: OrdensDeServicoService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
```

### Service

```typescript
@Injectable()
export class OrdensDeServicoService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<OrdemDeServico> {
    const os = await this.prisma.ordemDeServico.findUnique({ where: { id } });
    if (!os) throw new NotFoundException('OS não encontrada');
    return os;
  }
}
```

### DTOs

```typescript
// Sempre validar com class-validator
export class CreateOrdemDeServicoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsEnum(Prioridade)
  prioridade: Prioridade;
}
```

---

## 18. Módulos em Andamento

### Preventivas (~60%) — PRIORIDADE ALTA

**Pendente:**

- CRUD preventivas — rotas completas (em andamento)
- GET preventivas vencidas — endpoint para dashboard
- Agendamento de preventiva no equipamento

**Referência:** Lógica documentada no Notion  
`/📐 Lógica — Agendamento de Preventiva no Equipamento`

### Ordem de Serviço (~95%)

**Concluído:**

- Fluxo de status completo com todas as transições
- `inicializarOs` — EM_EXECUCAO + apoios
- `addApoio` — aceita OS em PAUSADA, AGUARDANDO_MATERIAL e AGUARDANDO_FISCALIZACAO
- `recusarFiscalizacao` — status vai para RECUSADO (não mais EM_EXECUCAO)
- `materiais-gastos.service.ts`:
  - Aceita EM_EXECUCAO, AGUARDANDO_MATERIAL e MATERIAL_COMPRADO
  - `remove()` com estorno de estoque + movimentação ENTRADA

**Pendente:**

- Endpoint OS aguardando fiscalização (para notificações)

### Materiais (~95%)

**Concluído:**

- `GET /materiais` — filtros por departamento, categoria, subcategoria e nome
- `POST /materiais-gastos` — registrar material utilizado em OS
- `useUpdateSolicitacaoStatus` — APROVAR/RECUSAR solicitação de compra

### Relatórios (~10%)

**Pendente (design front pronto):**

- GET dados por módulo (OS, Preventivas, Materiais, Equipamentos)
- Filtros por período/data
- Agregações: total por status, por técnico, por categoria

### Configuração (~90%)

**Pendente:**

- Endpoint alterar senha (PATCH /user/senha ou similar)
- Validar senha atual antes de atualizar

---

## 19. Fluxo de Status da OS (Backend)

```typescript
enum StatusOs {
  ABERTA
  EM_EXECUCAO
  PAUSADA
  AGUARDANDO_MATERIAL
  MATERIAL_COMPRADO
  AGUARDANDO_FISCALIZACAO
  RECUSADO          // ← recusarFiscalizacao vai aqui
  CONCLUIDA
  CANCELADA
}
```

**Transições validadas (11 total, 3 riscos mapeados — ver auditoria)**

**Regra crítica:** Todo endpoint que muda status deve validar transição permitida antes de persistir.

---

## 20. Regras de Negócio Importantes

### Materiais Gastos

- Só pode registrar gasto em OS com status: `EM_EXECUCAO`, `AGUARDANDO_MATERIAL`, `MATERIAL_COMPRADO`
- `remove()` deve:
  1. Estornar quantidade ao estoque do material
  2. Registrar movimentação do tipo `ENTRADA`

### Departamentos de Material

- Valores: `SHOPPING_COLINAS`, `GREEN_TOWER`, `ESTACIONAMENTO`
- Usar exatamente esses valores no model `Material`

### Solicitações de Compra

- Status: `PENDENTE` → `APROVADO` | `RECUSADO`
- Endpoint: PATCH com `{ status: 'APROVADO' | 'RECUSADO' }`

### Preventivas no Equipamento

- Agendamento cria vínculo Preventiva ↔ Equipamento
- Ver lógica completa no Notion antes de implementar

---

## 21. Prisma — Boas Práticas

```typescript
// Sempre tipar o retorno
async findMany(): Promise<Material[]> {
  return this.prisma.material.findMany()
}

// Migrations — NUNCA usar db push em produção
// Usar: npx prisma migrate dev --name descricao
```

**Referência de skill:** `/mnt/skills/user/prisma-migration-helper/SKILL.md`

---

## 22. Auth & Guards

```typescript
// Todos os endpoints protegidos por padrão
@UseGuards(JwtAuthGuard)

// Endpoints públicos
@Public()  // decorator custom

// Roles
@Roles('ADMIN', 'LIDER')
```

**Hook frontend relacionado:** `useOsPendentesFiscalizacao` usa `isLiderOuAdmin` para ativar refetch.

---

## 23. Regras Gerais

- Sempre validar DTO com `class-validator`
- Sempre lançar exceções semânticas: `NotFoundException`, `BadRequestException`, `ForbiddenException`
- Nunca expor dados sensíveis no retorno (senha, tokens)
- Toda mudança de status deve ser validada contra transições permitidas
- Toda operação de estoque deve gerar movimentação no histórico

# CLAUDE.md — Backend (Colinas)

> Projeto: Colinas — Gestão de Ativos e Ordens de Serviço  
> Stack: NestJS · Prisma · PostgreSQL · TypeScript  
> Atualizado: 2026-03-24

---
