import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
    const sessionToken = request.cookies.session_id;
    const storedSession = await session.findByValidToken(sessionToken);
    const userFound = await user.findById(storedSession.user_id);

    delete userFound.password;
    return response.status(200).json(userFound);
}
