/* eslint-disable no-console */
/**
 * One-shot data migration from one Postgres database to another.
 *
 * Usage:
 *   OLD_DATABASE_URL="postgresql://.../old?sslmode=require" \
 *   NEW_DATABASE_URL="postgresql://.../new?sslmode=require" \
 *   npx tsx db/migrate-data.ts
 *
 * Both URLs should be port 5432 (session mode) for reliable bulk copy.
 * Assumes the destination DB has an identical schema already applied
 * (run `npm run db:push` against NEW first).
 *
 * Behavior:
 * - Copies every row from every table listed in TABLES.
 * - Uses INSERT ... ON CONFLICT DO NOTHING so re-running is idempotent.
 * - Resets each table's serial sequence after insert.
 * - Prints a per-table summary.
 *
 * Delete this file once the migration is complete.
 */
import postgres from "postgres";

const OLD_URL = process.env.OLD_DATABASE_URL;
const NEW_URL = process.env.NEW_DATABASE_URL;

if (!OLD_URL || !NEW_URL) {
  console.error(
    "Set OLD_DATABASE_URL and NEW_DATABASE_URL env vars before running."
  );
  process.exit(1);
}

// Order does not matter here (no FKs between these tables), but we still list
// them explicitly so unknown tables are never touched.
const TABLES = [
  "about_page",
  "learning_page",
  "skills",
  "experiences",
  "certificates",
  "posts",
  "contact_submissions",
] as const;

// Tables that use a `serial` primary key named "id" — we reset the sequence
// after inserts so future INSERTs from the app do not collide with copied ids.
const SERIAL_ID_TABLES = new Set<string>([...TABLES]);

async function main() {
  const src = postgres(OLD_URL!, { max: 4, prepare: false });
  const dst = postgres(NEW_URL!, { max: 4, prepare: false });

  const summary: Array<{
    table: string;
    read: number;
    inserted: number;
    skipped: number;
  }> = [];

  try {
    for (const table of TABLES) {
      process.stdout.write(`\n[${table}] reading from source ... `);
      const rows = (await src.unsafe(
        `SELECT * FROM "${table}"`
      )) as Record<string, unknown>[];
      console.log(`${rows.length} row(s)`);

      if (rows.length === 0) {
        summary.push({ table, read: 0, inserted: 0, skipped: 0 });
        continue;
      }

      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");

      let inserted = 0;
      let skipped = 0;

      // Insert in batches to avoid oversized statements.
      const BATCH = 200;
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const values = batch.map((row) => columns.map((c) => row[c]));

        // Build a parameterized VALUES ($1,$2,...),($n,...) list.
        const placeholders = values
          .map(
            (_, rowIdx) =>
              `(${columns
                .map(
                  (__, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`
                )
                .join(", ")})`
          )
          .join(", ");
        const flat = values.flat();

        const query = `
          INSERT INTO "${table}" (${quotedCols})
          VALUES ${placeholders}
          ON CONFLICT DO NOTHING
        `;

        const result = await dst.unsafe(
          query,
          flat as postgres.ParameterOrJSON<never>[]
        );
        const rowsAffected =
          (result as unknown as { count?: number }).count ?? batch.length;
        inserted += rowsAffected;
        skipped += batch.length - rowsAffected;
        process.stdout.write(
          `  [${table}] batch ${i / BATCH + 1}: +${rowsAffected} inserted, ${
            batch.length - rowsAffected
          } skipped\n`
        );
      }

      // Reset sequence so new rows get correct IDs.
      if (SERIAL_ID_TABLES.has(table)) {
        try {
          await dst.unsafe(
            `SELECT setval(
               pg_get_serial_sequence('"${table}"', 'id'),
               COALESCE((SELECT MAX(id) FROM "${table}"), 1),
               (SELECT COUNT(*) > 0 FROM "${table}")
             )`
          );
          console.log(`  [${table}] sequence reset`);
        } catch (err) {
          console.warn(
            `  [${table}] could not reset sequence (may be harmless):`,
            err instanceof Error ? err.message : err
          );
        }
      }

      summary.push({ table, read: rows.length, inserted, skipped });
    }

    console.log("\n=== Migration Summary ===");
    for (const s of summary) {
      console.log(
        `  ${s.table.padEnd(22)} read=${s.read}  inserted=${s.inserted}  skipped=${s.skipped}`
      );
    }
    console.log("Done.");
  } catch (err) {
    console.error("\nMigration failed:", err);
    process.exitCode = 1;
  } finally {
    await src.end({ timeout: 5 });
    await dst.end({ timeout: 5 });
  }
}

main();
