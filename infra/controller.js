import * as cookie from "cookie";
import {
    InternalServerError,
    MethodNotAllowedError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "infra/errors/errors.js";
import session from "models/session.js";

async function onNoMatchHandler(request, response) {
    const publicObjectError = new MethodNotAllowedError();
    response.status(publicObjectError.statusCode).json(publicObjectError);
}

async function onErrorHandler(error, request, response) {
    if (error instanceof ValidationError) {
        return response.status(error.statusCode).json(error);
    }
    if (error instanceof NotFoundError) {
        return response.status(error.statusCode).json(error);
    }
    if (error instanceof UnauthorizedError) {
        return response.status(error.statusCode).json(error);
    }

    const publicObjectError = new InternalServerError({
        statusCode: error.statusCode,
        cause: error,
    });
    console.error(publicObjectError);
    response.status(publicObjectError.statusCode).json(publicObjectError);
}
async function setSessionCookie(token, response) {
    const setCookie = cookie.serialize("session_id", token, {
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    response.setHeader("Set-Cookie", [setCookie]);
}
async function clearSessionCookie(response) {
    const clearCookie = cookie.serialize("session_id", "", {
        httpOnly: true,
        path: "/",
        maxAge: -1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    response.setHeader("Set-Cookie", [clearCookie]);
}

const controller = {
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    },
    setSessionCookie,
    clearSessionCookie,
};

export default controller;
