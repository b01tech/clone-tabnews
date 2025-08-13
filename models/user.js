import database from "infra/database.js";
import { ValidationError } from "infra/errors/errors.js";

async function create(userInputValues) {
    await validateUserName(userInputValues.username);
    await validateEmail(userInputValues.email);
    const newUser = await runInsertQuery(userInputValues);
    return newUser;

    async function validateUserName(username) {
        if (username == "") {
            throw new ValidationError({
                message: "Nome de usuário é obrigatório",
                action: "Utilize outro nome de usuário",
            });
        }
        if (username.length < 3) {
            throw new ValidationError({
                message: "Nome de usuário deve ter pelo menos 3 caracteres",
                action: "Utilize outro nome de usuário",
            });
        }

        const result = await database.query({
            text: `SELECT username FROM users WHERE LOWER(username) = LOWER($1)`,
            values: [username],
        });
        if (result.rows.length > 0) {
            throw new ValidationError({
                message: "Nome de usuário já cadastrado",
                action: "Utilize outro nome de usuário",
            });
        }
    }
    async function validateEmail(email) {
        const result = await database.query({
            text: `SELECT email FROM users WHERE LOWER(email) = LOWER($1)`,
            values: [email],
        });
        if (result.rows.length > 0) {
            throw new ValidationError({
                message: "Email já cadastrado",
                action: "Utilize outro email",
            });
        }
    }

    async function runInsertQuery(userInputValues) {
        const result = await database.query({
            text: `INSERT INTO users (username, email, password)
               VALUES ($1, $2, $3)
               RETURNING *`,
            values: [
                userInputValues.username,
                userInputValues.email,
                userInputValues.password,
            ],
        });
        return result.rows[0];
    }
}

const user = {
    create,
};

export default user;
