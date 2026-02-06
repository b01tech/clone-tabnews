import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

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
        expect(responseBody).toEqual({
            id: responseBody.id,
            token: responseBody.token,
            user_id: responseBody.user_id,
            expires_at: responseBody.expires_at,
            created_at: responseBody.created_at,
            updated_at: responseBody.updated_at,
        });
        expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
        expect(Date.parse(responseBody.created_at)).not.toBeNaN();
        expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
        expect(responseBody.token).toHaveLength(96);

        const expiresAt = new Date(responseBody.expires_at);
        const createdAt = new Date(responseBody.created_at);

        const expirationTimeMilliseconds = expiresAt - createdAt;

        // Check if expiration is close to the expected expiration time (within 1 second)
        expect(
            session.EXPIRATION_IN_MILISECONDS - expirationTimeMilliseconds,
        ).toBeLessThan(1000);

        // Check if cookie is set
        const cookies = setCookieParser.parse(response);
        expect(cookies).toHaveLength(1);
        expect(cookies[0].name).toBe("session_id");
        expect(cookies[0].value).toBe(responseBody.token);
        expect(cookies[0].httpOnly).toBe(true);
        expect(cookies[0].path).toBe("/");
        expect(cookies[0].maxAge).toBe(
            session.EXPIRATION_IN_MILISECONDS / 1000,
        );
        expect(cookies[0].sameSite).toBe("Strict");
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
