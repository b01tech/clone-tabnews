import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import userModel from "models/user.js";
import passwordModel from "models/password.js";

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
            password: responseBody.password,
            created_at: responseBody.created_at,
            updated_at: responseBody.updated_at,
        });
        expect(uuidVersion(responseBody.id)).toBe(4);
        expect(Date.parse(responseBody.created_at)).not.toBeNaN();
        expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
        const userInDatabase = await userModel.findByUsername("John Doe");
        const passwordIsCorrect = await passwordModel.compare(
            "XXXXXXXXXXX",
            userInDatabase.password,
        );
        expect(passwordIsCorrect).toBe(true);
        const wrongPassword = await passwordModel.compare(
            "wrongpassword",
            userInDatabase.password,
        );
        expect(wrongPassword).toBe(false);
    });

    test("Create a user with email already registered should returns 400", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "Jane Doe",
                email: "jane.doe@example.com",
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
                username: "Jane Doe2",
                email: "Jane.Doe@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        const responseBody2 = await response2.json();
        expect(response2.status).toBe(400);
        expect(responseBody2).toEqual({
            name: "ValidationError",
            message: "Email já cadastrado",
            action: "Utilize outro email",
            status_code: 400,
        });
    });

    test("Create a user with username already registered should returns 400", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "Alice Doe",
                email: "alice.doe@example.com",
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
                username: "Alice Doe",
                email: "alice.doe2@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        const responseBody2 = await response2.json();
        expect(response2.status).toBe(400);
        expect(responseBody2).toEqual({
            name: "ValidationError",
            message: "Nome de usuário já cadastrado",
            action: "Utilize outro nome de usuário",
            status_code: 400,
        });
    });

    test("Create a user with username empty should returns 400", async () => {
        const response = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "",
                email: "empty@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toEqual({
            name: "ValidationError",
            message: "Nome de usuário é obrigatório",
            action: "Utilize outro nome de usuário",
            status_code: 400,
        });
    });

    test("Create a user with username with less than 3 characters should returns 400", async () => {
        const response = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "ab",
                email: "ab@example.com",
                password: "XXXXXXXXXXX",
            }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toEqual({
            name: "ValidationError",
            message: "Nome de usuário deve ter pelo menos 3 caracteres",
            action: "Utilize outro nome de usuário",
            status_code: 400,
        });
    });
});
