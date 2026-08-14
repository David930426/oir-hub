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

Infrastructure first — PostgreSQL, MinIO, Qdrant, and Ollama all run from the
[containers](https://github.com/David930426/containers) repo:

```bash
git clone https://github.com/David930426/containers.git
cd containers
docker compose up -d
```

Then the app:

```bash
pnpm install
npx simple-git-hooks       # enables commit-msg linting (Conventional Commits)
cp .env.example .env       # then fill in the values — see below
pnpm migrate               # create the tables
pnpm seed                  # create the first admin account
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the account
`pnpm seed` prints (`admin@thu.edu.tw` / `admin123` by default).

### Filling in `.env`

The defaults in `.env.example` do **not** match the containers repo. These four
need changing or nothing works:

| Variable | Use this | Why |
|---|---|---|
| `DATABASE_URL` | `postgresql://admin:admin123@localhost:5432/admin` | The example uses `postgres:postgres@.../oir_hub`; the container ships `admin`/`admin123` and names the database after the user. |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `admin` / `admin123` | The example uses `minioadmin`; uploads fail with `InvalidAccessKeyId` against the container. |
| `QDRANT_API_KEY` | any string, e.g. `devkey123` | See below — leaving it empty gives `Qdrant responded 401`. |
| `CHAT_MODEL` | `qwen2.5:3b` | The example points at `qwen2.5:7b` (~4.7 GB). The 3b variant is enough for local work; pull whichever you set. |

Generate `BETTER_AUTH_SECRET` with `npx @better-auth/cli secret`.

### Qdrant returns 401

Compose passes `QDRANT__SERVICE__API_KEY` through even when it is unset, so Qdrant
starts with authentication **on** and an empty key — every request is rejected.
Set the same value on both sides: `QDRANT_API_KEY=devkey123` in the containers
`.env`, recreate the container, then the same value in this repo's `.env`.

On Windows, create that file in an editor rather than with `echo >`: PowerShell
writes UTF-16 and Docker refuses to parse it.

### Ollama models

Pull both into the running container before indexing anything:

```bash
docker exec -it ollama ollama pull bge-m3       # embeddings, ~1.2 GB
docker exec -it ollama ollama pull qwen2.5:3b   # chat, ~2 GB
```

### Before the knowledge base has anything in it

`pnpm seed` only creates the admin account, so the content tables start empty and
the pickers on the create forms have nothing to offer. To get one document indexed
end to end:

1. `/admin/taxonomy` → create a category. Categories are scoped by kind — a
   `Post` category never appears in the FAQ picker, so pick **FAQ**.
2. `/admin/faqs` → create an FAQ. Both answer fields are required, and it needs at
   least one source (a label plus either an uploaded file or a URL).
3. Publish it — the knowledge index only reads published content.
4. `/admin/knowledge` → **Sync from content**, then **Re-index**. Sync is free;
   re-indexing embeds through Ollama and writes to Qdrant, so both must be running.

Uploads (`/admin/media/upload`) need the `oir` bucket to exist — create it in the
MinIO console at [http://localhost:9001](http://localhost:9001) first.

> Screens already wired to the database (users, categories & tags, the media
> library, FAQs, the knowledge index) need the containers running. `/chat` still
> renders from static mock data in [`lib/mock`](lib/mock).

## File storage (MinIO)

Uploads in the media library go to a MinIO bucket; only the object name is kept in
PostgreSQL. MinIO runs as part of the [containers](https://github.com/David930426/containers)
repo — no separate `docker run` needed.

Open the console at [http://localhost:9001](http://localhost:9001), sign in with
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
