import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "models/authentication.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
    const loginInputValues = request.body;
    const authenticatedUser =
        await authentication.getAuthenticatedUser(loginInputValues);
    console.log(authenticatedUser);

    return response.status(201).json({ message: "Session created" });
}
