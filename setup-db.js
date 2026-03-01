/**
 * setup-db.js
 * Automatically creates the Supabase database tables for SkillGig.
 *
 * Usage:
 *   node setup-db.js
 *
 * Requires DATABASE_URL env var OR DATABASE_URL in gig-backend/.env
 * Get it from: Supabase Dashboard → Project Settings → Database → Connection string → URI
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually read .env (no dotenv dependency needed)
function readEnvFile(filePath) {
  try {
    const lines = readFileSync(filePath, "utf8").split("\n");
    const env = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key) env[key.trim()] = rest.join("=").trim();
    }
    return env;
  } catch { return {}; }
}

const backendEnv = readEnvFile(join(__dirname, "gig-backend/.env"));
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || backendEnv.SUPABASE_DB_URL || backendEnv.DATABASE_URL;

if (!dbUrl) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  MANUAL SETUP REQUIRED                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  The database tables have NOT been created yet.              ║
║                                                              ║
║  QUICK FIX:                                                  ║
║  1. Go to https://supabase.com/dashboard                     ║
║  2. Open project: mbaywlmlbbahfmhclftz                       ║
║  3. Click "SQL Editor" in the left sidebar                   ║
║  4. Click "+ New query"                                      ║
║  5. Paste contents of SETUP_DATABASE.sql                     ║
║  6. Click "Run"                                              ║
║                                                              ║
║  To automate this next time, add to gig-backend/.env:        ║
║  DATABASE_URL=postgresql://postgres.[ref]:[password]@...     ║
║  (from Supabase → Project Settings → Database → URI)        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

// If DATABASE_URL is provided, run the SQL automatically
try {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected to database ✓");

  const sql = readFileSync(join(__dirname, "SETUP_DATABASE.sql"), "utf8");
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`Running ${statements.length} SQL statements...\n`);
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log("✓", stmt.split("\n")[0].slice(0, 70));
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("⚠ Already exists:", stmt.split("\n")[0].slice(0, 60));
      } else {
        console.error("✗ Error:", err.message);
      }
    }
  }
  await client.end();
  console.log("\n✅ Database setup complete! Restart your servers.");
} catch (err) {
  if (err.code === "ERR_MODULE_NOT_FOUND" || err.message?.includes("Cannot find package")) {
    console.error("Install pg first: cd gig-backend && npm install pg");
  } else {
    console.error("Database connection failed:", err.message);
  }
  process.exit(1);
}
