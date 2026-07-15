# OIR Hub — Study Abroad Information Center

A web platform for the **Office of International Relations (OIR), Tunghai University**, that helps Taiwan students who want to study abroad. It centralizes verified information (visas, scholarships, housing, exchange programs), publishes official announcements so students never miss a deadline, and answers questions 24/7 through a RAG chatbot grounded in the OIR knowledge base.

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
# 1. Install dependencies
pnpm install

# 2. Register the git hooks (required once after install)
#    Enables the commit-msg hook that checks commit messages
#    against Conventional Commits via commitlint.
npx simple-git-hooks

# 3. Configure environment
cp .env.example .env       # then fill in the values

# 4. Run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** the frontend currently runs on static mock data ([lib/mock-data.ts](lib/mock-data.ts)) — no database or backend is required to preview the UI yet.

## Database

Table definitions live in [`db/schema`](db/schema), split by domain:

- [`auth.schema.ts`](db/schema/auth.schema.ts) — `user`, `session`, `account`, `verification` (Better Auth core + admin plugin fields)
- [`chat.schema.ts`](db/schema/chat.schema.ts) — `conversations`, `messages`, `feedback`, `survey_responses`
- [`knowledge.schema.ts`](db/schema/knowledge.schema.ts) — `categories`, `documents`, `document_chunks`
- [`content.schema.ts`](db/schema/content.schema.ts) — `announcements`, `contact_messages`

[`db/index.ts`](db/index.ts) is the single entry point (`import { schema } from "@/db"`); hand-written queries go in `db/query`.

```bash
# Generate SQL migrations from the schema
pnpm exec drizzle-kit generate

# Apply migrations to the database in .env
pnpm migrate

# Inspect the database in a browser UI
pnpm exec drizzle-kit studio
```

## Routes

**Public (no login needed)**

| Route | Description |
|---|---|
| `/` | Landing page — intro, category quick links, latest announcements |
| `/knowledge` | Browse the knowledge base, filter by category and school |
| `/knowledge/[id]` | Read one document with author, dates, and attachments |
| `/announcements` | Published OIR news by category (scholarship / announcement / news) |
| `/announcements/[id]` | Read one announcement with attachments |
| `/chat` | RAG chatbot (full page; a floating widget is also available site-wide) |
| `/contact` | Contact form + office hours and staff directory |

**Auth (students optional, staff required)**

| Route | Description |
|---|---|
| `/login` | Log in |
| `/register` | Student sign-up (staff accounts are created by an admin) |
| `/profile` | Edit personal information and preferences |

**Admin (STAFF/ADMIN only)**

| Route | Description |
|---|---|
| `/admin` | Dashboard — chats/day, rating ratio, document status, unresolved contacts |
| `/admin/documents` | Manage KB documents: upload, retry FAILED, delete |
| `/admin/documents/[id]` | Inspect a document's chunks |
| `/admin/documents/[id]/edit` | Edit chunks (debug bad chunking) |
| `/admin/conversations` | Chat logs, filter by rating / language / time |
| `/admin/conversations/[id]` | Full transcript + retrieved chunks per answer |
| `/admin/announcements` | Create / edit / publish / delete announcements |
| `/admin/feedback` | Rating trends, model comparison, SUS results + CSV export |
| `/admin/users` | Manage staff & student accounts (ADMIN role only) |

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
| `pnpm migrate` | Apply Drizzle migrations to the database |
| `pnpm release` | Version bump + changelog (commit-and-tag-version) |
