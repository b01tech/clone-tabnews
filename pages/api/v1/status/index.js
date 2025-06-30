import database from "infra/database.js";

export default async function handler(request, response) {
    const updatedAt = new Date().toISOString();
    const dbVersion = await database.query("SHOW server_version;");
    const dbVersionValue = dbVersion.rows[0].server_version;
    const maxConnections = await database.query("SHOW max_connections;");
    const maxConnectionsValue = maxConnections.rows[0].max_connections;
    const databaseName = process.env.POSTGRES_DB;
    const currentConnections = await database.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname=$1;",
        values: [databaseName],
    });
    const currentConnectionsValue = currentConnections.rows[0].count;

    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: dbVersionValue,
                max_connections: maxConnectionsValue,
                current_connections: currentConnectionsValue,
            },
        },
    });
}
