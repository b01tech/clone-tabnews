import { Client } from "pg";

async function query(queryObj) {
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
    });
    console.log("===DEBUGGER===");
    console.log(`host: ${client.host}`);
    console.log(`port: ${client.port}`);
    console.log(`user: ${client.user}`);
    console.log(`database: ${client.database}`);
    console.log(`password: ${client.password}`);
    await client.connect();
    const result = await client.query(queryObj);
    await client.end();
    return result;
}

export default {
    query: query,
};
