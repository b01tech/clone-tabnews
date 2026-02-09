import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

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

async function deleteHandler(request, response) {
    const sessionToken = request.cookies.session_id;
    const sessionObj = await session.findByValidToken(sessionToken);
    const expiredSession = await session.expireById(sessionObj.id);

    await controller.clearSessionCookie(response);
    return response.status(200).json(expiredSession);
}
