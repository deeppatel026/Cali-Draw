# Excalidraw Clone - Real-time Collaborative Whiteboard

## Monorepo Structure (Turborepo + pnpm)
- apps/excalidraw-frontend — Next.js 15, React 19
- apps/http-backend — Express REST API (src/ has env.ts, index.ts, middleware.ts)
- apps/ws-backend — WebSocket server
- packages/db — Prisma client, exports `prismaClient` from @repo/db
- packages/common — Zod schemas, exports from @repo/common/zodschema
- packages/backend-common — Shared backend utils
- packages/ui — Shared React components @repo/ui

## Critical Import Paths
- Database: `import { prismaClient } from "@repo/db"`
- Schemas: `import { createUserSchema, signinUserSchema, createRoomSchema } from "@repo/common/zodschema"`

## Database (PostgreSQL on Neon)
- User.id is String (uuid)
- Room.id is Int (autoincrement)
- Room uses `created_date` not `createdAt`
- Room currently has: id, slug, created_date, adminId (no name field yet)

## TypeScript Conventions
- Always use explicit types: `const router: Router = Router()`
- Always type Express handlers: `async (req: Request, res: Response) =>`
- Use `res.status(...).json(...); return;` pattern (never `return res.status(...)`)
- pnpm monorepo requires explicit type annotations to avoid "inferred type" errors

