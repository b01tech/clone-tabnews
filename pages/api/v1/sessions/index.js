import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/errors/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
    const loginInputValues = request.body;
    try {
        const storedUser = await user.findByEmail(loginInputValues.email);
        const isPasswordCorrect = await password.compare(
            loginInputValues.password,
            storedUser.password,
        );

        if (!isPasswordCorrect) {
            throw new UnauthorizedError("Senha incorreta");
        }
    } catch (error) {
        throw new UnauthorizedError({
            message: "Email ou senha incorretos",
            action: "Verifique suas credenciais e tente novamente",
        });
    }

    return response.status(201).json({ message: "Session created" });
}
