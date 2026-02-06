import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
    const loginInputValues = request.body;
    const authenticatedUser =
        await authentication.getAuthenticatedUser(loginInputValues);
    console.log(authenticatedUser);
    const newSession = await session.create(authenticatedUser.id);
    return response.status(201).json(newSession);
}
