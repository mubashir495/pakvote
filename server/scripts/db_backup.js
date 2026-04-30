import { exec } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the backup directory exists
const backupDir = path.join(__dirname, "..", "backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `backup-${timestamp}`);

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/pakvote";
console.log(`Starting secure database backup for PakVote...`);
console.log(`Target Backup Path: ${backupPath}`);

// Run mongodump
const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup process failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`mongodump stderr: ${stderr}`);
  }
  console.log(`mongodump stdout: ${stdout}`);
  console.log(`Secure database backup completed successfully.`);
  console.log(`All voter, candidate, party, and election result data safely stored in: ${backupPath}`);
  
  console.log(`\n--- Recovery Plan ---`);
  console.log(`To restore this backup in an emergency, use the following command:`);
  console.log(`mongorestore --uri="${mongoUri}" "${backupPath}/<db_name>"`);
});
