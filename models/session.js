import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors/errors";
import crypto from "node:crypto";

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function findByValidToken(token) {
    const result = await database.query({
        text: "SELECT * FROM sessions WHERE token=$1 AND expires_at > NOW()",
        values: [token],
    });
    if (result.rows.length === 0) {
        throw new UnauthorizedError({
            message: "Usuário não possui sessão ativa",
            action: "Verifique se está logado e tente novamente",
        });
    }
    return result.rows[0];
}
async function create(userId) {
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

    const newSession = await runInsertQuery(token, userId, expiresAt);
    return newSession;
}
async function refresh(sessionId) {
    const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
    const results = await database.query({
        text: "UPDATE sessions SET expires_at=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
        values: [expiresAt, sessionId],
    });
    return results.rows[0];
}
async function expireById(sessionId) {
    const results = await database.query({
        text: "UPDATE sessions SET expires_at=expires_at - INTERVAL '1 year', updated_at=NOW() WHERE id=$1 RETURNING *",
        values: [sessionId],
    });
    return results.rows[0];
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
    refresh,
    expireById,
    EXPIRATION_IN_MILISECONDS,
};

export default session;
