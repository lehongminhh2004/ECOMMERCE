const { spawn } = require('child_process');
const fs = require('fs');

const connectionString = process.argv[2];
if (!connectionString) {
  console.error("Please provide the connection string: node restore.js \"your-connection-string\"");
  process.exit(1);
}

console.log("Reading backup.sql...");
let sql;
try {
  sql = fs.readFileSync('backup.sql', 'utf16le');
  if (sql.charCodeAt(0) === 0xFEFF) {
    sql = sql.slice(1);
  }
} catch (err) {
  console.error("Error reading file:", err.message);
  process.exit(1);
}

console.log("Starting Docker PostgreSQL client...");
const psql = spawn('docker', ['run', '--rm', '-i', 'postgres:16-alpine', 'psql', connectionString], {
  stdio: ['pipe', 'inherit', 'inherit']
});

console.log("Connected successfully. Restoring database schema and data (this may take a few seconds)...");

psql.stdin.on('error', (err) => {
  // Ignore write errors here since they will be caught by the process close/error handlers
});

psql.stdin.write(sql, 'utf8');
psql.stdin.end();

psql.on('close', (code) => {
  if (code === 0) {
    console.log("Database restored successfully via Docker!");
  } else {
    console.error(`Restore failed. Docker psql exited with code: ${code}`);
  }
});

psql.on('error', (err) => {
  console.error("Failed to start Docker container:", err.message);
});
