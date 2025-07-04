import runner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
    const dbClient = await database.createNewClient();

    const defaultMigrationOptions = {
        dbClient: dbClient,
        dryRun: true,
        direction: "up",
        dir: join("infra", "migrations"),
        verbose: true,
        migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
        const pendingMigrations = await runner(defaultMigrationOptions);
        await dbClient.end();
        return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
        const migratedMigrations = await runner({
            ...defaultMigrationOptions,
            dryRun: false,
        });
        await dbClient.end();

        if (migratedMigrations.length > 0) {
            return response.status(201).json(migratedMigrations);
        }
        return response.status(200).json(migratedMigrations);
    }

    return response.status(405).json({});
}
