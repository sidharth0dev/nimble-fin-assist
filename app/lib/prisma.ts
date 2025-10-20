"server only"

import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance across hot reloads and serverless invocations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('Missing POSTGRES_PRISMA_URL or DATABASE_URL environment variable')
  }

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache the client in dev to survive Next.js hot reloads; in prod each lambda may reuse the global
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

