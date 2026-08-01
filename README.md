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
| File storage | [MinIO](https://min.io) (S3-compatible) for the media library |

## Getting started

```bash
pnpm install
npx simple-git-hooks       # enables commit-msg linting (Conventional Commits)
cp .env.example .env       # then fill in the values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Screens that are already wired to the database (users, categories & tags, the media
> library) need PostgreSQL and MinIO running. The rest still renders from static mock
> data in [`lib/mock`](lib/mock).

## File storage (MinIO)

Uploads in the media library go to a MinIO bucket; only the object name is kept in
PostgreSQL. Run it with Docker:

```bash
docker run -d --name oir-minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=admin123 \
  -v oir-minio:/data \
  minio/minio server /data --console-address ":9001"
```

Then open the console at [http://localhost:9001](http://localhost:9001), sign in with
those credentials, and create a bucket named **`oir`** — or whatever you set
`MINIO_BUCKET` to. Keep the bucket private: the console never links to it directly.
`GET /api/media/[id]` checks the session and answers with a short-lived presigned URL,
so files stay unreachable without a staff login.

| Variable | Purpose |
|---|---|
| `MINIO_ENDPOINT` | Base URL of the MinIO API (`http://localhost:9000`). Must be reachable from the browser — downloads redirect to it. |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credentials; the root user works for local development. |
| `MINIO_BUCKET` | Bucket that holds uploaded files (`oir`). |

Accepted uploads and the size ceiling live in [`constant.ts`](constant.ts)
(`MEDIA_MIME_LABELS`, `MEDIA_MAX_BYTES`); the same limit is mirrored in
[`next.config.ts`](next.config.ts), since uploads travel through a server action.

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
