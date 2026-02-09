import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
});

describe("GET /api/v1/user", () => {
    test("With valid session should return 200", async () => {
        const createUser = await orchestrator.createUser({
            username: "UserOldWithValidSession",
            email: "useroldwithvalidsession@example.com",
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

        // refresh session
        const refreshedSession = await session.findByValidToken(
            sessionObj.token,
        );
        expect(refreshedSession.expires_at.getTime()).toBeGreaterThan(
            sessionObj.expires_at.getTime(),
        );
        expect(refreshedSession.updated_at.getTime()).toBeGreaterThan(
            sessionObj.updated_at.getTime(),
        );

        // set-cookie
        const cookies = setCookieParser.parse(response);
        expect(cookies).toHaveLength(1);
        expect(cookies[0].name).toBe("session_id");
        expect(cookies[0].value).toBe(refreshedSession.token);
        expect(cookies[0].httpOnly).toBe(true);
        expect(cookies[0].path).toBe("/");
        expect(cookies[0].maxAge).toBe(
            session.EXPIRATION_IN_MILISECONDS / 1000,
        );
        expect(cookies[0].sameSite).toBe("Strict");
    });
    test("With a valid old session return 200", async () => {
        jest.useFakeTimers({
            now: Date.now() - session.EXPIRATION_IN_MILISECONDS + 1000,
        });
        const createUser = await orchestrator.createUser({
            username: "UserWithValidSession",
        });
        const sessionObj = await orchestrator.createSession(createUser.id);
        jest.useRealTimers();

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

        // refresh session
        const refreshedSession = await session.findByValidToken(
            sessionObj.token,
        );
        expect(refreshedSession.expires_at.getTime()).toBeGreaterThan(
            sessionObj.expires_at.getTime(),
        );
        expect(refreshedSession.updated_at.getTime()).toBeGreaterThan(
            sessionObj.updated_at.getTime(),
        );

        // set-cookie
        const cookies = setCookieParser.parse(response);
        expect(cookies).toHaveLength(1);
        expect(cookies[0].name).toBe("session_id");
        expect(cookies[0].value).toBe(refreshedSession.token);
        expect(cookies[0].httpOnly).toBe(true);
        expect(cookies[0].path).toBe("/");
        expect(cookies[0].maxAge).toBe(
            session.EXPIRATION_IN_MILISECONDS / 1000,
        );
        expect(cookies[0].sameSite).toBe("Strict");
    });
    test("With non-existent session should return 401", async () => {
        const response = await fetch("http://localhost:3000/api/v1/user", {
            headers: {
                Cookie: `session_id=f0b62a00000000000000000000000000`,
            },
        });
        expect(response.status).toBe(401);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            name: "UnauthorizedError",
            message: "Usuário não possui sessão ativa",
            action: "Verifique se está logado e tente novamente",
            status_code: 401,
        });
    });
    test("With expired session should return 401", async () => {
        jest.useFakeTimers({
            now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS),
        });

        const createUser = await orchestrator.createUser({
            username: "UserWithExpiredSession",
            email: "user-expired-session@example.com",
        });
        const sessionObj = await orchestrator.createSession(createUser.id);
        jest.useRealTimers();

        const response = await fetch("http://localhost:3000/api/v1/user", {
            headers: {
                Cookie: `session_id=${sessionObj.token}`,
            },
        });
        expect(response.status).toBe(401);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            name: "UnauthorizedError",
            message: "Usuário não possui sessão ativa",
            action: "Verifique se está logado e tente novamente",
            status_code: 401,
        });
    });
});
