/**
 * Runs once when the Next server starts. Applies pending migrations so the
 * schema in `db/migrations/` is always what the running app expects.
 *
 * Not awaited: `npm run dev` starts Postgres and the web server together, and
 * the pages that do not need the database should serve while it comes up. A
 * failure is logged and the server carries on; `npm run db:migrate` applies
 * the migrations by hand once the database is reachable.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }

  const { DatabaseUnreachableError, migrateWithRetry } = await import('./src/lib/db/migrate')
  void migrateWithRetry()
    .then(applied => {
      console.log(applied.length ? `applied migrations: ${applied.join(', ')}` : 'database schema up to date')
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      console.error(
        error instanceof DatabaseUnreachableError
          ? `database unavailable: ${message}. Is \`npm run db\` running on port 5544?`
          : `${message}. Fix the file and run \`npm run db:migrate\`.`,
      )
    })
}
