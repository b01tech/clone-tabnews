import { Client } from "pg";

async function query(queryObj) {
    const client = new Client();
    await client.connect();
    const result = await client.query(queryObj);
    await client.end();
    return result;
}

export default {
    query: query,
};
