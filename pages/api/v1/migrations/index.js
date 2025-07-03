import runner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
    if (request.method === "GET") {
        const migration = await runner({
            databaseUrl: process.env.DATABASE_URL,
            dryRun: true,
            direction: "up",
            dir: join("infra", "migrations"),
            verbose: true,
            migrationsTable: "pgmigrations",
        });
        return response.status(200).json(migration);
    }

    if (request.method === "POST") {
        const migration = await runner({
            databaseUrl: process.env.DATABASE_URL,
            dryRun: false,
            direction: "up",
            dir: join("infra", "migrations"),
            verbose: true,
            migrationsTable: "pgmigrations",
        });
        return response.status(200).json(migration);
    }

    return response.status(405).json({});
}
