import { Client } from "pg";

async function query(queryObj) {
    const client = await createNewClient();
    try {
        const result = await client.query(queryObj);
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await client.end();
    }
}

async function createNewClient() {
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        ssl: process.env.NODE_ENV === "production" ? true : false,
    });
    await client.connect();
    return client;
}
const database = {
    query: query,
    createNewClient: createNewClient,
};

export default database;
