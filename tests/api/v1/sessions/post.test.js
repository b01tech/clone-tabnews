import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
    await orchestrator.createUser({
        username: "User Example",
        email: "user@example.com",
        password: "123456",
    });
});

describe("POST api/v1/sessions", () => {
    test("should return 201 and create a new session", async () => {
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "user@example.com",
                password: "123456",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(201);
        expect(responseBody.message).toBe("Session created");
    });
    test("should return 401 if email is incorrect", async () => {
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "incorrect@example.com",
                password: "123456",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody.message).toBe("Email ou senha incorretos");
    });
    test("should return 401 if password is incorrect", async () => {
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "user@example.com",
                password: "incorrect",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody.message).toBe("Email ou senha incorretos");
    });
    test("should return 401 if email and password are incorrect", async () => {
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "incorrect@example.com",
                password: "incorrect",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody.message).toBe("Email ou senha incorretos");
    });
});
