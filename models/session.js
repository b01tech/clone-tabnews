import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function findByValidToken(token) {
    const result = await database.query({
        text: "SELECT * FROM sessions WHERE token=$1 AND expires_at > NOW()",
        values: [token],
    });
    return result.rows[0];
}

async function create(userId) {
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

    const newSession = await runInsertQuery(token, userId, expiresAt);
    return newSession;
}

async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
        text: "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *",
        values: [token, userId, expiresAt],
    });
    return result.rows[0];
}

const session = {
    findByValidToken,
    create,
    EXPIRATION_IN_MILISECONDS,
};

export default session;
