# Cali-Draw

A production-grade real-time collaborative whiteboard. Draw, sketch, and brainstorm with multiple users on the same canvas simultaneously.

**Live:** [cali-draw.com](https://cali-draw.com) &nbsp;·&nbsp; **Status:** Active (bugs listed below)


---

## What it does

- Real-time multi-user canvas with WebSocket-driven state sync
- Room-based collaboration — share a URL, anyone with the link joins your canvas
- Shapes, lines, freehand drawing, colors, and stroke styles
- JWT-authenticated sessions across both REST and WebSocket layers
- Persistent canvas state via PostgreSQL

---

## Architecture

This isn't a monolith. Three independent services in a [Turborepo](https://turbo.build/) monorepo:

```
apps/
├── frontend        # Next.js 14 — canvas UI, auth flows
├── http-backend    # Node.js/Express — REST APIs, auth, room management
└── ws-backend      # Node.js — WebSocket server, real-time event broadcasting

packages/
├── db              # Prisma ORM, shared schema, migrations
└── ui              # Shared UI components
```

**How real-time sync works:**

```
Client A draws shape
    → WebSocket message to WS server
    → Server broadcasts to all clients in room (except sender)
    → Client B receives event and updates canvas state
    → Optimistic update on Client A, corrected by server broadcast if conflict
```

**Why separate the HTTP and WebSocket backends?**

They scale differently. HTTP traffic is bursty and stateless. WebSocket connections are persistent and stateful. Separating them means you can scale each independently without one bottlenecking the other.

---

## The hard parts (lessons learned)

**JWT on a WebSocket handshake is not the same as HTTP auth.**
Browsers don't send custom headers on WS upgrade requests. Token goes in the query param (`?token=...`), validated server-side before the connection is accepted. Get this wrong and anyone joins any room.

**Nginx reverse proxy needs WebSocket upgrade headers.**
Without `proxy_set_header Upgrade $http_upgrade` and `proxy_set_header Connection "Upgrade"`, the handshake silently fails. No error message. Nothing in the logs. Just no connection. Added 2 hours to the first deployment.

**Docker networking in production is not the same as localhost.**
`localhost` inside a container refers to that container, not the host machine. Services need to reference each other by container name in the Docker network. What worked perfectly in `docker-compose up` broke entirely on EC2 until this was fixed.

**Multi-user event ordering.**
When two users draw simultaneously, the server needs to maintain consistent ordering across all clients. Implemented deterministic event ordering with optimistic client-side updates and server broadcast corrections.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React, TypeScript, TailwindCSS, HTML5 Canvas API |
| HTTP Backend | Node.js, Express, TypeScript, JWT auth |
| WebSocket Backend | Node.js, TypeScript, ws library |
| Database | PostgreSQL (Neon Cloud), Prisma ORM |
| Infrastructure | AWS EC2, Docker, Docker Compose, Nginx, Let's Encrypt (TLS) |
| Monorepo | Turborepo, Bun |

---

## Running locally

**Prerequisites:** Node.js 18+, Bun, Docker, PostgreSQL

```bash
# Clone the repo
git clone https://github.com/deeppatel026/Cali-Draw.git
cd Cali-Draw

# Install dependencies
bun install

# Set up environment variables
cp apps/http-backend/.env.example apps/http-backend/.env
cp apps/ws-backend/.env.example apps/ws-backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Run database migrations
cd packages/db && bunx prisma migrate dev

# Start all services
bun run dev
```

Services start at:
- Frontend: `http://localhost:3000`
- HTTP Backend: `http://localhost:3001`
- WebSocket Backend: `ws://localhost:8080`

---

## Deployment

Deployed on AWS EC2 with Docker Compose and Nginx as reverse proxy.

```
Internet → Nginx (EC2)
              ├── / → frontend (port 3000)
              ├── /api → http-backend (port 3001)
              └── /ws → ws-backend (port 3002)
```

TLS via Let's Encrypt + Certbot with automatic renewal.

The Nginx WebSocket proxy config that took the longest to figure out:

```nginx
location /ws {
    proxy_pass http://ws-backend:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

---

## Known bugs

Being honest about this:

- Footer links don't work yet
- No back button on signup or canvas pages
- Share button on canvas does nothing

Fixing these. Deployed anyway because waiting for perfect means deploying nothing.

---

## What's next

- Fix the known bugs above
- LLM layer: "describe this diagram" feature using vision API
- Undo/redo support
- Export canvas as PNG/SVG
- Mobile touch support

---

