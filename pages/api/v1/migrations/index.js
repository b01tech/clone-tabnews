import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import runner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
    dryRun: true,
    direction: "up",
    dir: join("infra", "migrations"),
    verbose: true,
    migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
    let dbClient;

    try {
        dbClient = await database.createNewClient();

        const pendingMigrations = await runner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
        });
        return response.status(200).json(pendingMigrations);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
}

async function postHandler(request, response) {
    let dbClient;

    try {
        dbClient = await database.createNewClient();

        const migratedMigrations = await runner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
            dryRun: false,
        });

        if (migratedMigrations.length > 0) {
            return response.status(201).json(migratedMigrations);
        }
        return response.status(200).json(migratedMigrations);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
}
