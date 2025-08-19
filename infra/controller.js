import {
    InternalServerError,
    MethodNotAllowedError,
    ValidationError,
    NotFoundError,
} from "infra/errors/errors.js";

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
