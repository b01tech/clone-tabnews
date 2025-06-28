import database from "infra/database.js";

export default async function handler(request, response) {
    const updatedAt = new Date().toISOString();
    const dbVersion = await database.query("SHOW server_version;");
    const dbVersionValue = dbVersion.rows[0].server_version;
    const maxConnections = await database.query("SHOW max_connections;");
    const maxConnectionsValue = maxConnections.rows[0].max_connections;
    console.log(maxConnections);

    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: dbVersionValue,
                max_connections: maxConnectionsValue,
                current_connections: 0,
            },
        },
    });
}
