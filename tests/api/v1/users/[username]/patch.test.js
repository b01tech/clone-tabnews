import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import userModel from "models/user.js";
import passwordModel from "models/password.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runningPendingMigrations();
});

describe("PATCH api/v1/users/[username]", () => {
    test("Patch a registered user should returns 200", async () => {
        const response = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "patchuser",
                email: "patchuser@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response.status).toBe(201);
        const responsePatch = await fetch(
            "http://localhost:3000/api/v1/users/patchuser",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "patchuser2",
                    email: "patchuser2@example.com",
                }),
            },
        );
        expect(responsePatch.status).toBe(200);
        const responseBodyPatch = await responsePatch.json();
        expect(responseBodyPatch).toEqual({
            id: responseBodyPatch.id,
            username: "patchuser2",
            email: "patchuser2@example.com",
            password: responseBodyPatch.password,
            created_at: responseBodyPatch.created_at,
            updated_at: responseBodyPatch.updated_at,
        });
        expect(uuidVersion(responseBodyPatch.id)).toBe(4);
        expect(Date.parse(responseBodyPatch.created_at)).not.toBeNaN();
        expect(Date.parse(responseBodyPatch.updated_at)).not.toBeNaN();
        expect(
            responseBodyPatch.updated_at > responseBodyPatch.created_at,
        ).toBe(true);
    });
    test("Patch a user not registered should returns 404", async () => {
        const response = await fetch(
            "http://localhost:3000/api/v1/users/notexists",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "Jane Doe",
                    email: "jane.doe@example.com",
                    password: "XXXXXXXXXXX",
                }),
            },
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
    test("Patch a user with email already registered should returns 400", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "email1",
                email: "email1@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response1.status).toBe(201);
        const response2 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "email2",
                email: "email2@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response2.status).toBe(201);
        const response3 = await fetch(
            "http://localhost:3000/api/v1/users/email2",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "email1@example.com",
                }),
            },
        );
        expect(response3.status).toBe(400);
        const responseBody3 = await response3.json();
        expect(responseBody3).toEqual({
            name: "ValidationError",
            message: "Email já cadastrado",
            action: "Utilize outro email",
            status_code: 400,
        });
    });
    test("Patch a user with username already registered should returns 400", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "user1",
                email: "user1@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response1.status).toBe(201);
        const response2 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "user2",
                email: "user2@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response2.status).toBe(201);
        const response3 = await fetch(
            "http://localhost:3000/api/v1/users/user2",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "user1",
                }),
            },
        );
        expect(response3.status).toBe(400);
        const responseBody3 = await response3.json();
        expect(responseBody3).toEqual({
            name: "ValidationError",
            message: "Nome de usuário já cadastrado",
            action: "Utilize outro nome de usuário",
            status_code: 400,
        });
    });
    test("Patch a new password should returns 200", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "password1",
                email: "password1@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        expect(response1.status).toBe(201);
        const response2 = await fetch(
            "http://localhost:3000/api/v1/users/password1",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: "YYYYYYYYYYY",
                }),
            },
        );
        expect(response2.status).toBe(200);
        const responseBody2 = await response2.json();
        expect(responseBody2).toEqual({
            id: responseBody2.id,
            username: "password1",
            email: "password1@example.com",
            password: responseBody2.password,
            created_at: responseBody2.created_at,
            updated_at: responseBody2.updated_at,
        });
        const userInDatabase = await userModel.findByUsername("password1");
        const passwordIsCorrect = await passwordModel.compare(
            "YYYYYYYYYYY",
            userInDatabase.password,
        );
        expect(passwordIsCorrect).toBe(true);
        const wrongPassword = await passwordModel.compare(
            "XXXXXXXXXXX",
            userInDatabase.password,
        );
        expect(wrongPassword).toBe(false);
    });
});
