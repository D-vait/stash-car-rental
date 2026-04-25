import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schemas/index.js";


const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/stash";

const client = postgres(connectionString);

export const db = drizzle(client, { schema })