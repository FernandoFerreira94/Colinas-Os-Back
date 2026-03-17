# CLAUDE.md — Colinas Gestão de Ativos e Ordem de Serviço

> Este arquivo contém todo o contexto do projeto para o assistente de IA.
> Leia este arquivo completamente antes de qualquer tarefa.

---

## 1. Visão Geral do Projeto

**Nome:** Colinas — Gestão de Ativos e Ordem de Serviço
**Cliente:** Shopping Colinas
**Responsável do cliente:** Evandro (Gerente de Operações)

**Objetivo:** Sistema interno de gestão para o complexo Shopping Colinas, cobrindo:
- Ordem de Serviço (OS) com controle de status, técnicos e materiais
- Manutenção preventiva com checklist por tipo de equipamento
- Controle de ativos (equipamentos do complexo)
- Almoxarifado: estoque, entrada/saída, solicitação de compra
- Gestão de funcionários e turnos
- Relatórios de produtividade e consumo de material

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js, React, TailwindCSS, shadcn/ui |
| Formulários | React Hook Form + Zod |
| Requisições | React Query (cache + estado servidor) |
| Backend | NestJS (Node.js) |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Deploy | AWS |
| Validação DTOs | class-validator + class-transformer |

---

## 3. Estrutura do Complexo

O sistema gerencia **dois complexos distintos** que devem ser separados nas OS e no estoque:

- `SHOPPING` — Shopping Colinas
- `TORRE_COMERCIAL` — Torre Comercial
- `ESTACIONAMENTO` — Estacionamento

---

## 4. Perfis de Usuário (Funções)

```
GERENTE
COORDENADOR
SUPERVISOR
LIDER
ELETRICISTA
TECNICO_REFRIGERACAO
OFICIAL_GERAL
```

- `is_admin` — acesso administrativo completo
- `is_almoxarife` — acesso ao módulo de almoxarifado

---

## 5. Módulos do Sistema

### 5.1 Ordem de Serviço

**Tipos de OS:**
- `CORRETIVA` — correção de algo existente
- `MELHORIA` — criação de algo novo
- `ACOMPANHAMENTO` — fiscalização de empresa terceirizada
- `PREVENTIVA` — gerada automaticamente pelo sistema de preventivas

**Fluxo de Status:**
```
ABERTA
  → EM_EXECUCAO
    → AGUARDANDO_MATERIAL
        → MATERIAL_COMPRADO   → EM_EXECUCAO (retorna)
        → MATERIAL_RECUSADO   → técnico decide alternativa
    → AGUARDANDO_FISCALIZACAO
        → FINALIZADA
```

**Prioridade:** `BAIXA` | `MEDIA` | `ALTA`

**Cada OS contém:**
- Tipo, status, prioridade
- Complexo + localização
- Técnico responsável (obrigatório)
- Técnicos de apoio (N:N — tabela OsApoio)
- Equipamento vinculado (opcional)
- Empresa terceirizada (opcional — para OS de acompanhamento)
- Materiais gastos
- Solicitações de compra vinculadas
- Respostas de checklist (para OS do tipo PREVENTIVA)
- Fotos (array de URLs S3 — opcional)
- Observação do fiscal (preenchida na fiscalização)
- Preventiva geradora (opcional)

---

### 5.2 Preventivas

- São **entidades separadas** das OS, mas geram uma OS do tipo `PREVENTIVA`
- Cada preventiva tem um `ChecklistTemplate` vinculado ao tipo de equipamento
- Ao finalizar a OS gerada, o sistema agenda automaticamente a próxima preventiva com base em `frequencia_dias`

**Status da Preventiva:** `AGENDADA` | `EM_EXECUCAO` | `FINALIZADA` | `ATRASADA`

---

### 5.3 Checklist

- Cada tipo de equipamento tem um `ChecklistTemplate` com seus `ChecklistItem`
- Ao executar uma OS preventiva, o técnico responde cada item: `conforme: boolean + observacao`
- Templates planejados: Ar Condicionado, Quadro Elétrico, Bomba

---

### 5.4 Equipamentos

**Categorias:** `Eletrica` | `Refrigeracao`

**Tipos de equipamento:**
Quadro de energia, Ar condicionado, Bomba, Chiller, Ventilador, Exaustor,
Escada rolante, Elevador, Torre de resfriamento, Fans

**Cada equipamento tem:**
- Tag formatada (ex: `AC-01`)
- Categoria + tipo
- Localização (complexo, andar, área)
- Empresa terceirizada (opcional — para equipamentos com manutenção terceirizada)
- Modelo, fabricante, descrição
- Fotos (array de URLs S3 — opcional)
- Status ativo/inativo

**Página de detalhe do equipamento** exibe:
- Dados do equipamento
- Histórico de OS vinculadas
- Histórico de preventivas

---

### 5.5 Materiais e Almoxarifado

**Material:**
- Nome, código interno, unidade, quantidade em estoque
- Quantidade mínima (alerta de estoque baixo)
- Valor unitário (para relatórios de custo)
- Complexo de origem
- Categoria → Subcategoria

**Movimentações:** `ENTRADA` | `SAIDA`

**MaterialGasto:** vinculado a uma OS — registra o que foi consumido

**SolicitacaoCompra:**
- Pode ser vinculada a uma OS ou avulsa
- Pode referenciar material existente ou informar nome de material novo
- Status: `PENDENTE` | `APROVADA` | `RECUSADA` | `COMPRADO`
- O status `COMPRADO` aciona notificação no Dashboard e altera OS para `MATERIAL_COMPRADO`

> ⚠️ Os materiais gastos precisam ser exportáveis para tabela externa — manter `valor_unitario` sempre atualizado.

---

### 5.6 Funcionários e Turnos

- Funcionários com matrícula, CPF, função, equipe, plantão
- Controle de dispensa (`date_termination + ativo: false`)
- Turnos: Diurno / Noturno
- `TurnoFuncionario` — histórico de qual funcionário esteve em qual turno

---

### 5.7 Relatórios

- Produtividade por funcionário (OS finalizadas + apoios)
- Custo de material por complexo e departamento
- OS por status e categoria
- Preventivas atrasadas, agendadas, finalizadas

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

enum CategoriaEquipamento {
  Eletrica
  Refrigeracao
}

enum Complexo {
  SHOPPING
  TORRE_COMERCIAL
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
  AGUARDANDO_MATERIAL
  MATERIAL_COMPRADO
  MATERIAL_RECUSADO
  AGUARDANDO_FISCALIZACAO
  FINALIZADA
}

enum Prioridade {
  BAIXA
  MEDIA
  ALTA
}

enum StatusPreventiva {
  AGENDADA
  EM_EXECUCAO
  FINALIZADA
  ATRASADA
}

enum StatusSolicitacao {
  PENDENTE
  APROVADA
  RECUSADA
  COMPRADO
}

enum TipoMovimentacao {
  ENTRADA
  SAIDA
}

enum FuncaoUser {
  GERENTE
  COORDENADOR
  SUPERVISOR
  LIDER
  ELETRICISTA
  TECNICO_REFRIGERACAO
  OFICIAL_GERAL
}

model User {
  id               String     @id @default(uuid())
  nameFull         String
  matricula        Int        @unique
  cpf              String     @unique
  funcao           FuncaoUser
  is_admin         Boolean    @default(false)
  is_almoxarife    Boolean    @default(false)
  plantao          String
  equipe           String
  ativo            Boolean    @default(true)
  date_register    DateTime
  date_termination DateTime?
  password         String
  os_finalizadas   Int        @default(0)
  os_apoio         Int        @default(0)
  created_at       DateTime   @default(now())

  ordens_responsavel OrdemServico[]      @relation("TecnicoResponsavel")
  ordens_apoio       OsApoio[]
  solicitacoes       SolicitacaoCompra[]
  turno              TurnoFuncionario[]
}

model Localizacao {
  id         String   @id @default(uuid())
  complexo   Complexo
  andar      String?
  area       String?
  created_at DateTime @default(now())

  equipamentos   Equipamentos[]
  ordens_servico OrdemServico[]
}

model CategoriaEquipamentoModel {
  id           String               @id @default(uuid())
  categoria    CategoriaEquipamento
  tag          String               @unique
  tipo         String               @unique
  created_at   DateTime             @default(now())

  equipamentos Equipamentos[]

  @@map("categoria_equipamento")
}

model Equipamentos {
  id               String                    @id @default(uuid())
  ativo            Boolean                   @default(true)
  name_equipamento String
  tag_formatada    String                    @unique
  num_tag          Int
  categoria_id     String
  categoria        CategoriaEquipamentoModel @relation(fields: [categoria_id], references: [id])
  localizacao_id   String?
  localizacao      Localizacao?              @relation(fields: [localizacao_id], references: [id])
  empresa_id       String?
  empresa          EmpresaTerceirizada?      @relation(fields: [empresa_id], references: [id])
  modelo           String?
  fabricante       String?
  local_instalacao String?
  descricao        String?
  fotos            String[]
  created_at       DateTime                  @default(now())

  ordens_servico OrdemServico[]
  preventivas    Preventiva[]
}

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

model OrdemServico {
  id                  String               @id @default(uuid())
  titulo              String
  descricao           String?
  tipo                TipoOS
  status              StatusOS             @default(ABERTA)
  prioridade          Prioridade           @default(MEDIA)
  complexo            Complexo
  localizacao_id      String?
  localizacao         Localizacao?         @relation(fields: [localizacao_id], references: [id])
  equipamento_id      String?
  equipamento         Equipamentos?        @relation(fields: [equipamento_id], references: [id])
  tecnico_id          String
  tecnico             User                 @relation("TecnicoResponsavel", fields: [tecnico_id], references: [id])
  empresa_id          String?
  empresa             EmpresaTerceirizada? @relation(fields: [empresa_id], references: [id])
  preventiva_id       String?
  preventiva          Preventiva?          @relation(fields: [preventiva_id], references: [id])
  fotos               String[]
  observacao_fiscal   String?
  created_at          DateTime             @default(now())
  updated_at          DateTime             @updatedAt
  finalizada_at       DateTime?

  apoios              OsApoio[]
  materiais_gastos    MaterialGasto[]
  solicitacoes        SolicitacaoCompra[]
  checklist_respostas ChecklistResposta[]
}

model OsApoio {
  id      String       @id @default(uuid())
  os_id   String
  os      OrdemServico @relation(fields: [os_id], references: [id])
  user_id String
  user    User         @relation(fields: [user_id], references: [id])

  @@unique([os_id, user_id])
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

  ordens_servico OrdemServico[]
}

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

  respostas ChecklistResposta[]
}

model ChecklistResposta {
  id         String        @id @default(uuid())
  os_id      String
  os         OrdemServico  @relation(fields: [os_id], references: [id])
  item_id    String
  item       ChecklistItem @relation(fields: [item_id], references: [id])
  conforme   Boolean
  observacao String?

  @@unique([os_id, item_id])
}

model CategoriaMaterial {
  id        String                @id @default(uuid())
  categoria String                @unique
  subCategorias SubCategoriaMaterial[]
}

model SubCategoriaMaterial {
  id           String            @id @default(uuid())
  subCategoria String
  categoria_id String
  categoria    CategoriaMaterial @relation(fields: [categoria_id], references: [id])
  materiais    Material[]

  @@unique([subCategoria, categoria_id])
}

model Material {
  id                String               @id @default(uuid())
  nome              String
  codigo            String?              @unique
  unidade           String
  quantidade        Float                @default(0)
  quantidade_minima Float                @default(0)
  valor_unitario    Float?
  complexo          Complexo
  subcategoria_id   String
  subcategoria      SubCategoriaMaterial @relation(fields: [subcategoria_id], references: [id])
  ativo             Boolean              @default(true)
  created_at        DateTime             @default(now())
  updated_at        DateTime             @updatedAt

  movimentacoes MovimentacaoEstoque[]
  gastos        MaterialGasto[]
  solicitacoes  SolicitacaoCompra[]
}

model MovimentacaoEstoque {
  id          String           @id @default(uuid())
  material_id String
  material    Material         @relation(fields: [material_id], references: [id])
  tipo        TipoMovimentacao
  quantidade  Float
  observacao  String?
  created_at  DateTime         @default(now())
}

model MaterialGasto {
  id          String       @id @default(uuid())
  os_id       String
  os          OrdemServico @relation(fields: [os_id], references: [id])
  material_id String
  material    Material     @relation(fields: [material_id], references: [id])
  quantidade  Float
  created_at  DateTime     @default(now())
}

model SolicitacaoCompra {
  id             String            @id @default(uuid())
  os_id          String?
  os             OrdemServico?     @relation(fields: [os_id], references: [id])
  material_id    String?
  material       Material?         @relation(fields: [material_id], references: [id])
  nome_material  String?
  quantidade     Float
  justificativa  String?
  status         StatusSolicitacao @default(PENDENTE)
  solicitante_id String
  solicitante    User              @relation(fields: [solicitante_id], references: [id])
  created_at     DateTime          @default(now())
  updated_at     DateTime          @updatedAt
}

model Turno {
  id          String             @id @default(uuid())
  nome        String
  hora_inicio String
  hora_fim    String
  created_at  DateTime           @default(now())

  funcionarios TurnoFuncionario[]
}

model TurnoFuncionario {
  id          String    @id @default(uuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  turno_id    String
  turno       Turno     @relation(fields: [turno_id], references: [id])
  data_inicio DateTime
  data_fim    DateTime?

  @@unique([user_id, turno_id, data_inicio])
}
```

---

## 7. Status de Desenvolvimento

| Módulo | Back | Front | % |
|---|---|---|---|
| Auth / Login | ✅ | ✅ | 100% |
| User Profile | ✅ | ✅ | 95% |
| Funcionários | ✅ | ✅ | 95% |
| Equipamentos | ⚡ ajuste schema | ✅ | 80% |
| Categoria/Subcategoria Material | ✅ | ✅ | 90% |
| Materiais (estoque) | 🔲 | 🎨 design | 20% |
| Turnos | 🔲 | 🎨 design | 25% |
| Dashboard | 🔲 | 🎨 design | 20% |
| Ordem de Serviço | 🔲 | 🎨 design + modal | 20% |
| Preventivas | 🔲 | 🎨 design | 15% |
| Checklist | 🔲 | 🔲 | 0% |
| Localização | 🔲 | 🔲 | 0% |
| Empresas Terceirizadas | 🔲 | 🔲 | 0% |
| Solicitação de Compra | 🔲 | 🔲 | 0% |
| Upload Fotos (S3) | 🔲 | 🔲 | 0% |
| Relatórios | 🔲 | 🔲 | 0% |

**Progresso geral: ~30%**
**Estimativa de conclusão: 6 semanas (5h/dia)**

---

## 8. Ordem de Implementação Definida

1. ✅ Atualizar schema Prisma completo + migrations
2. ⚡ Ajustar módulo Equipamentos (schema + DTO + service)
3. 🔲 Ajustar módulo Funcionários (funcao: FuncaoUser enum)
4. 🔲 Módulo Localização (CRUD simples)
5. 🔲 Módulo Empresas Terceirizadas (CRUD simples)
6. 🔲 Módulo Ordem de Serviço completo
7. 🔲 Módulo Preventivas + geração automática de OS
8. 🔲 Módulo Checklist (templates + respostas)
9. 🔲 Módulo Material completo (estoque + movimentação)
10. 🔲 Módulo Solicitação de Compra
11. 🔲 Upload de fotos (AWS S3)
12. 🔲 Dashboard (queries agregadas)
13. 🔲 Relatórios

---

## 9. Convenções do Projeto

### NestJS
- Cada módulo tem: `controller`, `service`, `dto/create`, `dto/update`, `module`
- Sempre usar `PartialType` no UpdateDto
- Sempre validar existência com `findOne` antes de `update` e `delete`
- Retornar sempre com `include` das relações necessárias
- Usar `NotFoundException` do `@nestjs/common`

### Prisma
- Sempre usar `@@map` ao renomear models para preservar tabelas existentes
- `String[]` para arrays de URLs de fotos — já é opcional por padrão
- Campos opcionais sempre com `?` no schema e `@IsOptional()` no DTO

### Frontend (Next.js)
- React Query para todas as requisições
- React Hook Form + Zod para formulários
- shadcn/ui + TailwindCSS para componentes
- Sempre tipar retornos com base no schema Prisma

---

## 10. Decisões Arquiteturais Importantes

| Decisão | Justificativa |
|---|---|
| Preventiva separada da OS | Preventiva = plano recorrente. OS = execução. Misturar complica manutenção |
| equipamento_id opcional na OS | Nem toda OS tem equipamento (ex: melhorias de infraestrutura) |
| fotos como String[] | Armazena URLs do S3, simples e eficiente com Prisma + PostgreSQL |
| Complexo no Material e na OS | Permite separar custo e controle por complexo nos relatórios |
| OsApoio como tabela N:N | Permite rastrear contribuição de cada técnico para relatórios de produtividade |
| FuncaoUser como enum | Garante consistência e permite lógica de permissões por função |
