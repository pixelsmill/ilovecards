# Story 1.2 : Base de données & schéma Auth

Status: ready-for-dev

## Story

En tant que développeur,
je veux la base de données initialisée avec les tables Auth.js,
afin que les sessions et tokens puissent être persistés.

## Acceptance Criteria

1. `DATABASE_URL` dans `.env.local` pointe vers une base Neon réelle (connection pooler URL)
2. `prisma/schema.prisma` contient les 4 modèles Auth.js : User, Account, Session, VerificationToken — avec les champs exacts requis par `@auth/prisma-adapter`
3. `npx prisma migrate dev --name init-auth` s'exécute sans erreur — migration créée dans `prisma/migrations/`
4. `npx prisma generate` produit les types TypeScript — `@prisma/client` typé correctement
5. `src/lib/prisma.ts` exporte un singleton PrismaClient (pattern global pour éviter les connexions multiples en dev hot-reload)
6. `npm run build` passe toujours sans erreur après ajout de `src/lib/prisma.ts`

## Tasks / Subtasks

- [ ] Créer la base de données Neon (AC: 1)
  - [ ] Créer un projet sur https://console.neon.tech (si pas encore fait)
  - [ ] Copier la **Connection pooler URL** (format : `postgresql://user:pass@host-pooler.neon.tech/dbname?sslmode=require`)
  - [ ] Mettre à jour `.env.local` : `DATABASE_URL="<pooler-url>"`
  - [ ] Mettre à jour la variable `DATABASE_URL` dans Vercel dashboard avec la vraie valeur

- [ ] Initialiser Prisma (AC: 2, 3)
  - [ ] `npx prisma init --datasource-provider postgresql` — crée `prisma/schema.prisma` et `.env` (supprimer `.env` si créé, on utilise `.env.local`)
  - [ ] Remplacer le contenu de `prisma/schema.prisma` par le schéma Auth.js complet (voir Dev Notes)

- [ ] Créer `src/lib/prisma.ts` singleton (AC: 5)
  - [ ] Implémenter le singleton PrismaClient avec pattern global (voir Dev Notes)

- [ ] Exécuter la migration (AC: 3, 4)
  - [ ] `npx prisma migrate dev --name init-auth`
  - [ ] Vérifier que `prisma/migrations/` contient le dossier de migration
  - [ ] Vérifier que `npx prisma generate` produit les types sans erreur

- [ ] Vérifier le build (AC: 6)
  - [ ] `npm run build` — doit passer sans erreur

## Dev Notes

### Schéma Prisma — Auth.js v5 (@auth/prisma-adapter)

Le package `@auth/prisma-adapter@2.x` (installé) nécessite ce schéma exact :

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}
```

**Note :** `directUrl` est optionnel en dev local mais recommandé pour Neon (permet les migrations sans passer par le pooler). Ajouter `DATABASE_URL_UNPOOLED` dans `.env.local` et Vercel avec la **Direct connection URL** (sans `-pooler` dans l'hostname).

Si pas de `directUrl`, supprimer la ligne — les migrations fonctionneront mais seront plus lentes sur Neon.

### Singleton PrismaClient — pattern obligatoire

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Ce pattern évite la création de centaines de connexions lors du hot-reload en dev.

### Neon — deux URLs

Dans le dashboard Neon → votre projet → Connection details :
- **Pooled connection** : `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require` → `DATABASE_URL`
- **Direct connection** : `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require` → `DATABASE_URL_UNPOOLED` (pour les migrations)

### Prisma init — attention au .env

`npx prisma init` crée un fichier `.env` à la racine. Ce fichier EST gitignored par notre `.gitignore` (`.env` pattern). Le supprimer car on utilise `.env.local`. Le `DATABASE_URL` doit être dans `.env.local` uniquement.

### Ce que cette story NE fait PAS

- Pas de configuration Auth.js / next-auth (→ story 1.3)
- Pas de modèles Deck, Card, Review (→ stories 2.1, 2.3, 3.3)
- Pas de seed data

### Références

- Architecture : sessions BDD, PrismaAdapter [Source: architecture.md#Data Architecture]
- Architecture : singleton prisma.ts [Source: architecture.md#Patterns d'Implémentation]
- Architecture : connection pooling Neon [Source: architecture.md#Infrastructure & Déploiement]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
