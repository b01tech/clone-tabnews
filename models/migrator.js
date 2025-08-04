import runner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

const defaultMigrationOptions = {
    dryRun: true,
    direction: "up",
    dir: join("infra", "migrations"),
    verbose: true,
    migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
    let dbClient;

    try {
        dbClient = await database.createNewClient();

        const pendingMigrations = await runner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
        });
        return pendingMigrations;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
}
async function applyPendingMigrations() {
    let dbClient;

    try {
        dbClient = await database.createNewClient();

        const migratedMigrations = await runner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
            dryRun: false,
        });
        return migratedMigrations;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
}

const migrator = {
    listPendingMigrations: listPendingMigrations,
    applyPendingMigrations: applyPendingMigrations,
};
export default migrator;
