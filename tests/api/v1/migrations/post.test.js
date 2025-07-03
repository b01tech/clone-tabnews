import database from "infra/database.js";

beforeAll(cleanDatabase);
async function cleanDatabase() {
    await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

test("POST to api/v1/migrations deve retornar 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
    });
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    console.log(responseBody);

    expect(Array.isArray(responseBody)).toBe(true);
});
