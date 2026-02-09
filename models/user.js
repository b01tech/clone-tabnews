import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors/errors.js";

async function create(userInputValues) {
    await validateUserName(userInputValues.username);
    await validateEmail(userInputValues.email);
    await validatePassword(userInputValues.password);
    await hashPasswordInObject(userInputValues);
    const newUser = await runInsertQuery(userInputValues);
    return newUser;

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

async function update(username, userInputValues) {
    const user = await findByUsername(username);
    if (
        "username" in userInputValues &&
        !compareNames(user.username, userInputValues.username)
    ) {
        await validateUserName(userInputValues.username);
    }
    if ("email" in userInputValues) {
        await validateEmail(userInputValues.email);
    }
    if ("password" in userInputValues) {
        await validatePassword(userInputValues.password);
        await hashPasswordInObject(userInputValues);
    }
    const userWithNewValues = { ...user, ...userInputValues };
    const userUpdated = await runUpdateQuery(userWithNewValues);
    return userUpdated;

    async function runUpdateQuery(userWithNewValues) {
        const result = await database.query({
            text: `UPDATE users SET username = $1, email = $2, password = $3, updated_at = timezone('utc', now()) WHERE id = $4 RETURNING *`,
            values: [
                userWithNewValues.username,
                userWithNewValues.email,
                userWithNewValues.password,
                userWithNewValues.id,
            ],
        });
        return result.rows[0];
    }
}

async function findByUsername(username) {
    const result = await database.query({
        text: `SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
        values: [username],
    });
    if (result.rows.length === 0) {
        throw new NotFoundError({
            message: "Usuário não encontrado",
            action: "Utilize outro nome de usuário",
        });
    }
    return result.rows[0];
}
async function findByEmail(email) {
    const result = await database.query({
        text: `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        values: [email],
    });
    if (result.rows.length === 0) {
        throw new NotFoundError({
            message: "Usuário não encontrado",
            action: "Utilize outro email",
        });
    }
    return result.rows[0];
}
async function findById(id) {
    const result = await database.query({
        text: `SELECT * FROM users WHERE id = $1 LIMIT 1`,
        values: [id],
    });
    if (result.rows.length === 0) {
        throw new NotFoundError({
            message: "Usuário não encontrado",
            action: "Utilize outro id",
        });
    }
    return result.rows[0];
}

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
    if (email == "") {
        throw new ValidationError({
            message: "Email é obrigatório",
            action: "Utilize outro email",
        });
    }
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
async function validatePassword(password) {
    if (password.length < 6) {
        throw new ValidationError({
            message: "Senha deve ter pelo menos 6 caracteres",
            action: "Utilize outra senha",
        });
    }
}
function compareNames(value1, value2) {
    return value1.toLowerCase() === value2.toLowerCase();
}
async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
}

const user = {
    create,
    update,
    findByUsername,
    findByEmail,
    findById,
};

export default user;
