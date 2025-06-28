test("GET to api/v1/status deve retornar 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    const parsedUpadateAt = new Date(responseBody.updated_at).toISOString();
    expect(parsedUpadateAt).toEqual(responseBody.updated_at);

    console.log(responseBody);

    expect(responseBody.dependencies.database.version).toEqual("16.9");
});
