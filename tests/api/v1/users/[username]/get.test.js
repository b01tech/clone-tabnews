import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
});

describe("GET api/v1/users/[username]", () => {
    test("Get a user should returns 200", async () => {
        await orchestrator.createUser({
            username: "JohnDoe",
            email: "john.doe@example.com",
            password: "XXXXXXXXXXX",
        });
        const response = await fetch(
            "http://localhost:3000/api/v1/users/JohnDoe",
        );
        expect(response.status).toBe(200);
        const userData = await response.json();
        expect(userData).toEqual({
            id: userData.id,
            username: "JohnDoe",
            email: "john.doe@example.com",
            password: userData.password,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
        });
        expect(uuidVersion(userData.id)).toBe(4);
        expect(Date.parse(userData.created_at)).not.toBeNaN();
        expect(Date.parse(userData.updated_at)).not.toBeNaN();
    });
    test("Get a user with Case Sensitive mismatch should returns 200", async () => {
        await orchestrator.createUser({
            username: "JaneDoe",
            email: "jane.doe@example.com",
            password: "XXXXXXXXXXX",
        });
        const response = await fetch(
            "http://localhost:3000/api/v1/users/janedoE",
        );
        expect(response.status).toBe(200);
        const userData = await response.json();
        expect(userData).toEqual({
            id: userData.id,
            username: "JaneDoe",
            email: "jane.doe@example.com",
            password: userData.password,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
        });
        expect(uuidVersion(userData.id)).toBe(4);
        expect(Date.parse(userData.created_at)).not.toBeNaN();
        expect(Date.parse(userData.updated_at)).not.toBeNaN();
    });
    test("Get a user not registered should returns 404", async () => {
        const response = await fetch(
            "http://localhost:3000/api/v1/users/notexists",
        );
        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            name: "NotFoundError",
            message: "Usuário não encontrado",
            action: "Utilize outro nome de usuário",
            status_code: 404,
        });
    });
});
