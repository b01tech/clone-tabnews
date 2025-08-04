import {
    InternalServerError,
    MethodNotAllowedError,
} from "infra/errors/errors.js";

async function onNoMatchHandler(request, response) {
    const publicObjectError = new MethodNotAllowedError();
    response.status(publicObjectError.statusCode).json(publicObjectError);
}

async function onErrorHandler(error, request, response) {
    const publicObjectError = new InternalServerError({
        statusCode: error.statusCode,
        cause: error,
    });
    console.error(publicObjectError);
    response.status(publicObjectError.statusCode).json(publicObjectError);
}

const controller = {
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    },
};

export default controller;
