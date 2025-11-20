import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user";

async function waitForAllServices() {
    await waitForWebServer();

    async function waitForWebServer() {
        return retry(fetchStatusPage, {
            retries: 30,
            maxTimeout: 2000,
            onRetry: (err, attempt) => {
                console.log(
                    `Tentativa ${attempt} falhou, tentando novamente...`,
                );
            },
        });

        async function fetchStatusPage() {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/v1/status",
                );
                if (response.status !== 200) {
                    throw new Error(`Status ${response.status}`);
                }
            } catch (error) {
                console.log("Erro ao conectar com servidor:", error.message);
                throw error;
            }
        }
    }
}

async function clearDatabase() {
    await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

async function runningPendingMigrations() {
    await migrator.applyPendingMigrations();
}
async function createUser(userObject) {
    await user.create(userObject);
}

const orchestrator = {
    waitForAllServices,
    clearDatabase,
    runningPendingMigrations,
    createUser,
};

export default orchestrator;
