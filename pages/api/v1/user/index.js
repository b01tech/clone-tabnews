import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
    const sessionToken = request.cookies.session_id;
    const storedSession = await session.findByValidToken(sessionToken);
    const userFound = await user.findById(storedSession.user_id);
    const refreshedSession = await session.refresh(storedSession.id);
    await controller.setSessionCookie(refreshedSession.token, response);

    delete userFound.password;
    response.setHeader(
        "Cache-Control",
        "no-store, no-cache, max-age=0, must-revalidate",
    );
    return response.status(200).json(userFound);
}
