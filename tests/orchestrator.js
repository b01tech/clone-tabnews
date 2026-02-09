import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";

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
    var validUserData = {
        username: userObject.username || "User Example",
        email: userObject.email || "user@example.com",
        password: userObject.password || "123456",
    };
    return await user.create(validUserData);
}
async function createSession(userId) {
    const newSession = await session.create(userId);
    return newSession;
}

const orchestrator = {
    waitForAllServices,
    clearDatabase,
    runningPendingMigrations,
    createUser,
    createSession,
};

export default orchestrator;
