// Loaded FIRST by main.ts. Loads backend/.env and stops with a clear message if it is missing/incomplete.
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const envPath = join(__dirname, '..', '.env');

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (!process.env.DB_PASSWORD) {
  console.error(`\n✖ Could not find the .env file at:\n  ${envPath}\n  Create it with:  cp .env.example .env   (the name must be exactly ".env")\n`);
  process.exit(1);
}

if (!process.env.DB_PASSWORD) {
  console.error(`\n✖ DB_PASSWORD is empty in ${envPath}\n  Add a line like:  DB_PASSWORD=your_postgres_password\n`);
  process.exit(1);
}

console.log(`.env loaded → DB ${process.env.DB_USERNAME}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
