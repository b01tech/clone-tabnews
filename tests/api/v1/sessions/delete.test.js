import session from "models/session.js";
import setCookieParser from "set-cookie-parser";
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

describe("DELETE api/v1/sessions", () => {
    test("with valid session should return 200 and delete the session", async () => {
        const userObj = await orchestrator.createUser({
            username: "Valid User",
            email: "valid-user@example.com",
            password: "123456",
        });
        const sessionObj = await orchestrator.createSession(userObj.id);
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "DELETE",
            headers: {
                cookie: `session_id=${sessionObj.token}`,
            },
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        // Check if the session is expired
        expect(new Date(responseBody.expires_at).getTime()).toBeLessThan(
            Date.now(),
        );
        // Check if cookie is cleared
        const cookies = setCookieParser.parse(response);
        expect(cookies).toHaveLength(1);
        expect(cookies[0].name).toBe("session_id");
        expect(cookies[0].value).toBe("");
        expect(cookies[0].httpOnly).toBe(true);
        expect(cookies[0].path).toBe("/");
        expect(cookies[0].maxAge).toBe(-1);
        expect(cookies[0].sameSite).toBe("Strict");
    });
    test("with non-existent session should return 401", async () => {
        const nonExistentSessionToken = "00000000000000000000000000000000";
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "DELETE",
            headers: {
                cookie: `session_id=${nonExistentSessionToken}`,
            },
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody).toEqual({
            name: "UnauthorizedError",
            message: "Usuário não possui sessão ativa",
            action: "Verifique se está logado e tente novamente",
            status_code: 401,
        });
    });
    test("with expired session should return 401", async () => {
        jest.useFakeTimers({
            now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS),
        });
        const createUser = await orchestrator.createUser({
            username: "UserWithExpiredSession",
            email: "user-expired-session@example.com",
        });
        const sessionObj = await orchestrator.createSession(createUser.id);
        jest.useRealTimers();

        const response = await fetch("http://localhost:3000/api/v1/sessions", {
            method: "DELETE",
            headers: {
                cookie: `session_id=${sessionObj.token}`,
            },
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody).toEqual({
            name: "UnauthorizedError",
            message: "Usuário não possui sessão ativa",
            action: "Verifique se está logado e tente novamente",
            status_code: 401,
        });
    });
});
