import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, NotFoundError } from "infra/errors/errors.js";

async function getAuthenticatedUser(loginInputValues) {
    let storedUser;
    try {
        validateInputs(loginInputValues);
        storedUser = await getStoredUser(loginInputValues.email);
        await validatePassword(loginInputValues.password, storedUser.password);
    } catch (error) {
        if (
            error instanceof UnauthorizedError ||
            error instanceof NotFoundError
        ) {
            throw new UnauthorizedError({
                message: "Email ou senha incorretos",
                action: "Verifique suas credenciais e tente novamente",
            });
        }
        throw error;
    }
    return storedUser;
}
function validateInputs(inputValues) {
    if (inputValues.email == "" || inputValues.password.length < 6) {
        throw new UnauthorizedError({
            message: "Email e/ou senha inválidos",
            action: "Preencha os campos corretamente",
        });
    }
}
async function getStoredUser(email) {
    const storedUser = await user.findByEmail(email);
    if (!storedUser) {
        throw new NotFoundError("Email não cadastrado");
    }
    return storedUser;
}
async function validatePassword(inputPassword, storedPassword) {
    const isPasswordCorrect = await password.compare(
        inputPassword,
        storedPassword,
    );

    if (!isPasswordCorrect) {
        throw new UnauthorizedError("Senha incorreta");
    }
}

const authentication = {
    getAuthenticatedUser,
};

export default authentication;
