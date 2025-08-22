import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
    const { username } = request.query;
    const userData = await user.findByUsername(username);
    return response.status(200).json(userData);
}

async function patchHandler(request, response) {
    const { username } = request.query;
    const userInputValues = request.body;
    const userUpdated = await user.update(username, userInputValues);
    return response.status(200).json(userUpdated);
}
