export class InternalServerError extends Error {
    constructor({ cause, statusCode }) {
        super("Um erro interno ocorreu.", {
            cause,
        });
        this.name = "InternalServerError";
        this.action = "Entre em contato com o suporte técnico.";
        this.statusCode = statusCode || 500;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.statusCode,
        };
    }
}

export class ServiceError extends Error {
    constructor({ cause, message }) {
        super(message || "Serviço indisponível no momento.", {
            cause,
        });
        this.name = "ServiceError";
        this.action = "Verifique se o serviço está disponível.";
        this.statusCode = 503;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.statusCode,
        };
    }
}

export class MethodNotAllowedError extends Error {
    constructor() {
        super("O método não é permitido para esse endpoint");
        this.name = "MethodNotAllowedError";
        this.action =
            "Consulte a documentação da API para obter mais informações.";
        this.statusCode = 405;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.statusCode,
        };
    }
}
export class ValidationError extends Error {
    constructor({ action, message }) {
        super(message || "Dados inválidos");
        this.name = "ValidationError";
        this.action =
            action || "Verifique os dados fornecidos e tente novamente";
        this.statusCode = 400;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.statusCode,
        };
    }
}
