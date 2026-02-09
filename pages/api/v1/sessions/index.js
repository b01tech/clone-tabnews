import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
    const loginInputValues = request.body;
    const authenticatedUser =
        await authentication.getAuthenticatedUser(loginInputValues);
    console.log(authenticatedUser);
    const newSession = await session.create(authenticatedUser.id);
    await controller.setSessionCookie(newSession.token, response);

    return response.status(201).json(newSession);
}
