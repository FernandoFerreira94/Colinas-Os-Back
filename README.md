# Colinas — Backend

Sistema de gestão interna do Shopping Colinas para controle de Ordens de Serviço, Equipamentos, Materiais, Preventivas e Relatórios.

## Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **ORM:** Prisma
- **Banco:** PostgreSQL (Supabase)
- **Auth:** JWT + Guards
- **Validação:** class-validator + class-transformer
- **Upload:** AWS S3

## Requisitos

- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas (`.env`)

## Instalação
```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

## Variáveis de ambiente
```env
DATABASE_URL=
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=
```

## Módulos

| Módulo | Status |
|---|---|
| Auth / Usuários | ✅ 100% |
| Ordem de Serviço | 🔨 ~95% |
| Equipamentos | ✅ ~95% |
| Materiais | 🔨 ~95% |
| Preventivas | 🔨 ~60% |
| Configuração | ✅ ~90% |
| Relatórios | ⏳ ~10% |

## Fluxo da OS
```
ABERTA → EM_EXECUCAO → AGUARDANDO_MATERIAL → MATERIAL_COMPRADO
       → EM_EXECUCAO → AGUARDANDO_FISCALIZACAO → FINALIZADA
                                               → RECUSADO
```

## Scripts
```bash
npm run start:dev       # desenvolvimento
npm run build           # build produção
npm run start:prod      # produção
npx prisma migrate dev  # nova migration
npx prisma studio       # UI do banco
```

## Estrutura
```
src/
  modulo/
    modulo.controller.ts
    modulo.service.ts
    modulo.module.ts
    dto/
```

## Licença

Privado — uso interno Shopping Colinas.