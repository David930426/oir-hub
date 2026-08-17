# OIR Hub — project conventions

Next.js 16 App Router, Drizzle + PostgreSQL, Better Auth, shadcn/ui, Tailwind v4.
The public site is anonymous; `/admin` is the OIR staff console.

The RAG assistant is **not part of the product right now**. Its tables —
`chat_*`, `kb_documents`, `kb_chunks` — are still in `db/schema/` so the ERD is
intact, but nothing reads or writes them, and there is no chat UI, no knowledge
index and no Ollama/Qdrant client. Build the rest of the console first.

## Where code goes

| Kind of code | Location | Naming |
| --- | --- | --- |
| Server actions | `lib/actions/` | `<domain>.action.ts` |
| Database reads & writes | `lib/repositories/` | `<domain>.repository.ts` |
| Zod schemas | `lib/validator/` | `<domain>.validator.ts` |
| Shared constants | `constant.ts` (repo root) | `SCREAMING_SNAKE_CASE` exports |
| Reusable components | `components/ui/` | kebab-case `.tsx` |
| Components used by one page only | next to that page | `app/admin/users/columns.tsx` |
| Helpers (`cn`, formatters) | `lib/utils.ts` | — |
| Access control | `dal.ts` | `require*` / `has*` |
| Object storage (MinIO) | `lib/storage.ts` | — |
| Schema | `db/schema/<domain>.schema.ts` | — |

Rules that follow from the table:

- **Actions.** Every file starts with `"use server"`, and every exported action
  starts with a `dal.ts` guard (`requireAdmin`, `requireWriter`, …) — a page
  guard does not protect an action, which is its own entry point. Validate input
  with the domain's zod schema, call a repository, `revalidatePath()`, and return
  the shared `ActionResult` from `lib/utils.ts` — `{ success, message }`, with a
  sentence the caller can toast either way, plus an optional `data` for the few
  callers that need a value back. Use the helpers rather than rebuilding them:
  `parseInput` (validate, or return the failure as-is), `ok` / `fail`,
  `describeError`, `emptyToNull`, `pluralize`. Submitting the contact form is
  the only guardless action — the site is anonymous by design — and it says so
  at the top of its file.
- **Repositories.** The only place that imports `@/db` (besides `db/`,
  `lib/auth.ts` and `seed.ts`). Pages and actions never build queries
  themselves. Repositories take and return plain data — no `redirect()`, no
  `revalidatePath()`, no formatting for display.
- **Constants.** `constant.ts` must not import from `db/`, `dal.ts`, or
  `lib/mock` — client components import it too. Anything shared by more than one
  file, or repeated copy, belongs here: enum value lists, tab lists, limits,
  timezone, error messages. Values bound to a domain type (an empty-form
  fixture, for example) stay beside the page that uses them.
- **Components.** `components/ui/` holds shadcn primitives *and* app components
  reused across screens. A component only one page renders lives in that page's
  route folder. `components/admin/`, `components/shared/` and `components/site/`
  predate this rule and still hold cross-page components; put new reusable ones
  in `components/ui/`.

## Tables

Use the shadcn DataTable — `components/ui/data-table.tsx`, built on
`@tanstack/react-table` — rather than filtering rows by hand around `<Table>`:

- `columns.tsx` beside the page defines `ColumnDef[]` and the row type.
- The page (a server component) fetches through a repository, formats dates, and
  passes plain rows down.
- The screen's table component renders `<DataTable columns={…} data={…}
  toolbar={(table) => …} />`; the toolbar drives `table.getColumn(id)
  .setFilterValue()` and `table.setGlobalFilter()`, so sorting, filtering and
  pagination all come from the one table instance.
- Columns that should not answer to the search box set
  `enableGlobalFilter: false`.

`app/admin/users/` is the reference implementation of this whole flow.

## Create and edit screens

Creating or editing a record gets its own route, not a dialog:

```
app/admin/<domain>/page.tsx             list  → /admin/<domain>
app/admin/<domain>/create/page.tsx      form  → /admin/<domain>/create
app/admin/<domain>/[id]/edit/page.tsx   form  → /admin/<domain>/<id>/edit
```

The route's `page.tsx` is a server component: it fetches through a repository,
renders a back link plus `PageHeader`, and hands plain values to a colocated
client form (`create-user-form.tsx`, `edit-user-form.tsx`). The form uses
react-hook-form with `zodResolver` over the domain validator, calls the action,
toasts the returned message, and `router.push()`es back to the list. Dialogs are
still right for confirmations — deactivating an account, resetting a password —
just not for forms.

## Other conventions

- **Dates** are formatted on the server with `formatDay` / `formatMinute` from
  `lib/utils.ts`, pinned to `TIME_ZONE`. Never `toLocaleString()` in a client
  component — the visitor's timezone would mismatch on hydration.
- **Roles** are `admin | editor | viewer` (`STAFF_ROLES`). There are no student
  accounts: the public site is anonymous.
- **Enum display** goes through the label/tone maps in `lib/mock/labels.ts`
  (`EnumBadge`), so a stored value reads the same everywhere.
- **Logging** uses `lib/logger.ts` (pino). Log unexpected errors in actions; do
  not leak internals into the message shown to the user.
- **Uploads** go through a server action into MinIO via `lib/storage.ts`; only the
  object name is stored, on `media_files.storage_path`. The bucket is private, so
  downloads go through `GET /api/media/[id]`, which checks the session and
  redirects to a short-lived presigned URL. Write the bytes before the row and
  clean the object up if the insert fails.
- **`lib/mock/`** is design-stage data. Screens still reading from it are not yet
  wired to the database; move them onto a repository when their turn comes.

## Commands

```bash
pnpm dev        # next dev, piped through pino-pretty
pnpm migrate    # drizzle-kit push
pnpm seed       # first admin account (see seed.ts for flags)
pnpm lint       # eslint
```

Commits follow Conventional Commits (commitlint + `pnpm release`).
