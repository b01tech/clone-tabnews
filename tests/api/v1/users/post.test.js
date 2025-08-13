import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
});

describe("POST api/v1/users", () => {
    test("Create a user should returns 201", async () => {
        const response = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "John Doe",
                email: "john.doe@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        const responseBody = await response.json();

        expect(response.status).toBe(201);
        expect(responseBody).toEqual({
            id: responseBody.id,
            username: "John Doe",
            email: "john.doe@example.com",
            password: "XXXXXXXXXXX",
            created_at: responseBody.created_at,
            updated_at: responseBody.updated_at,
        });
        expect(uuidVersion(responseBody.id)).toBe(4);
        expect(Date.parse(responseBody.created_at)).not.toBeNaN();
        expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
});
