import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { getDatabaseConfig } from "@/lib/env";

import * as schema from "./schema";

let database: LibSQLDatabase<typeof schema> | null = null;

export function getDb() {
  if (!database) {
    const config = getDatabaseConfig();
    const client = createClient({
      url: config.url,
      authToken: config.authToken,
    });

    database = drizzle(client, { schema });
  }

  return database;
}

export { schema };
