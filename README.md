# OIR Hub — Study Abroad Information Center

A platform for Tunghai University's Office of International Relations. It centralizes study-abroad info (visas, scholarships, housing, exchange programs), publishes announcements, and answers questions via a RAG chatbot.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Forms | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Database | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://www.better-auth.com) (admin plugin for roles/deactivation) |
| RAG | [Qdrant](https://qdrant.tech) vector DB + local LLMs via [Ollama](https://ollama.com) |

## Getting started

```bash
pnpm install
npx simple-git-hooks       # enables commit-msg linting (Conventional Commits)
cp .env.example .env       # then fill in the values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> The frontend currently runs on static mock data ([lib/mock-data.ts](lib/mock-data.ts)) — no database is required to preview the UI yet.

## Database

Schemas live in [`db/schema`](db/schema), one file per domain:

| File | Tables |
|---|---|
| [`auth.schema.ts`](db/schema/auth.schema.ts) | `user`, `session`, `account`, `verification` |
| [`chat.schema.ts`](db/schema/chat.schema.ts) | `conversations`, `messages`, `feedback`, `survey_responses` |
| [`knowledge.schema.ts`](db/schema/knowledge.schema.ts) | `categories`, `documents`, `document_chunks` |
| [`content.schema.ts`](db/schema/content.schema.ts) | `announcements`, `contact_messages` |

[`db/index.ts`](db/index.ts) is the entry point (`import { schema } from "@/db"`); hand-written queries go in `db/query`.

```bash
pnpm exec drizzle-kit generate   # generate SQL migrations from the schema
pnpm migrate                     # apply migrations to the database in .env
pnpm exec drizzle-kit studio     # inspect the database in a browser UI
```

## Routes

**Public**

| Route | Description |
|---|---|
| `/` | Landing page |
| `/knowledge`, `/knowledge/[id]` | Browse / read knowledge base documents |
| `/announcements`, `/announcements/[id]` | Browse / read OIR announcements |
| `/chat` | RAG chatbot |
| `/contact` | Contact form + office hours |

**Auth** — `/login`, `/register`, `/profile`

**Admin** (STAFF/ADMIN only)

| Route | Description |
|---|---|
| `/admin` | Dashboard — chats/day, ratings, document status |
| `/admin/documents`, `/admin/documents/[id]`, `.../edit` | Manage & inspect KB documents and chunks |
| `/admin/conversations`, `/admin/conversations/[id]` | Chat logs + retrieved chunks per answer |
| `/admin/announcements` | Create / edit / publish / delete announcements |
| `/admin/feedback` | Rating trends, model comparison, SUS results, CSV export |
| `/admin/users` | Manage accounts (ADMIN only) |

## Project structure

```
app/            Next.js App Router pages
├── (site)/     Public + auth pages (shared header/footer/chat widget)
├── chat/       Full-page chatbot UI
└── admin/      Admin console (sidebar layout)
components/
├── ui/         shadcn/ui primitives
├── site/       Header, footer, chat widget, shared cards
└── admin/      Admin sidebar, status badges
db/
├── index.ts    Database entry point (re-exports schema)
└── schema/     Drizzle table definitions, one file per domain
lib/            Utilities and mock data
public/         OIR Tunghai logos and images
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm migrate` | Apply Drizzle migrations |
| `pnpm release` | Version bump + changelog |
