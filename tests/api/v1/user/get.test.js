import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
});

describe("GET /api/v1/user", () => {
    test("With valid session should return 200", async () => {
        const createUser = await orchestrator.createUser({
            username: "UserWithValidSession",
        });
        const sessionObj = await orchestrator.createSession(createUser.id);

        const response = await fetch("http://localhost:3000/api/v1/user", {
            headers: {
                Cookie: `session_id=${sessionObj.token}`,
            },
        });
        const responseBody = await response.json();
        expect(response.status).toBe(200);
        expect(responseBody).toEqual({
            id: createUser.id,
            username: createUser.username,
            email: createUser.email,
            created_at: createUser.created_at.toISOString(),
            updated_at: createUser.updated_at.toISOString(),
        });
    });
});
