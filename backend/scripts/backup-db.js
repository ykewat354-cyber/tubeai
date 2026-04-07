/**
 * Database Backup Script
 *
 * Creates timestamped PostgreSQL dumps, auto-cleans old backups.
 *
 * Usage:
 *   node scripts/backup-db.js          # Create backup + cleanup
 *   node scripts/backup-db.js list     # List available backups
 *
 * Recommended cron (daily at 3 AM):
 *   0 3 * * * cd /path/to/backend && node scripts/backup-db.js
 *
 * Requires: pg_dump (from PostgreSQL package)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BACKUP_DIR = path.join(__dirname, "../../backup");
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 14;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Failed: DATABASE_URL environment variable is required");
  process.exit(1);
}

function parseDatabaseUrl(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/);
  if (!match) {
    console.error("Invalid DATABASE_URL format");
    process.exit(1);
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

function createBackup() {
  const db = parseDatabaseUrl(DATABASE_URL);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `tubeai-backup-${timestamp}.sql`;
  const backupPath = path.join(BACKUP_DIR, filename);

  console.log(`Backing up database: ${db.database}`);

  const cmd =
    `PGPASSWORD=${db.password} pg_dump ` +
    `-h ${db.host} -p ${db.port} -U ${db.user} ` +
    `-d ${db.database} -F c -f ${backupPath}`;

  try {
    execSync(cmd, { stdio: "inherit" });
    const stats = fs.statSync(backupPath);
    console.log(`Backup created: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    return backupPath;
  } catch (error) {
    console.error("Backup failed:", error.message);
    throw error;
  }
}

function cleanupOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql"));
  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const age = now - fs.statSync(filePath).mtimeMs;
    if (age > retentionMs) {
      fs.unlinkSync(filePath);
      deleted++;
    }
  });

  console.log(`Cleaned up ${deleted} old backup(s)`);
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) { console.log("No backups found"); return; }
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql"));
  if (files.length === 0) { console.log("No backups found"); return; }
  console.log("Available backups:");
  files.sort().reverse().forEach((file) => {
    const s = fs.statSync(path.join(BACKUP_DIR, file));
    console.log(`  ${file}  (${(s.size / 1024 / 1024).toFixed(2)}MB, ${s.mtime.toLocaleDateString()})`);
  });
}

const action = process.argv[2];
if (action === "list") { listBackups(); }
else { createBackup(); cleanupOldBackups(); }
