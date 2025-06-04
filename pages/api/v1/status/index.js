import database from "infra/database.js";

export default async function handler(request, response) {
    const q = "SELECT 1 + 1 AS SUM;";
    const result = await database.query(q);
    console.log(result.rows);
    response.status(200).json({ message: "Página de STATUS" });
}
