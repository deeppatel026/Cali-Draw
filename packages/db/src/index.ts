
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function makeClient() {
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prismaClient = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;
