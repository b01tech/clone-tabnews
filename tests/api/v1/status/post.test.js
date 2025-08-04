import orchestrator from "tests/orchestrator.js";

beforeAll(async () => await orchestrator.waitForAllServices());

describe("POST api/v1/status", () => {
    test("Retrieving current system status using POST should returns 405", async () => {
        const response = await fetch("http://localhost:3000/api/v1/status", {
            method: "POST",
        });
        expect(response.status).toBe(405);
        const responseBody = await response.json();
        expect(responseBody).toMatchObject({
            name: "MethodNotAllowedError",
            message: "O método não é permitido para esse endpoint",
            action: "Consulte a documentação da API para obter mais informações.",
            status_code: 405,
        });
    });
});
