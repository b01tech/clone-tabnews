import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "models/authentication.js";
import session from "models/session.js";
import * as cookie from "cookie";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
    const loginInputValues = request.body;
    const authenticatedUser =
        await authentication.getAuthenticatedUser(loginInputValues);
    console.log(authenticatedUser);
    const newSession = await session.create(authenticatedUser.id);
    const setCookie = cookie.serialize("session_id", newSession.token, {
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    response.setHeader("Set-Cookie", [setCookie]);
    return response.status(201).json(newSession);
}
