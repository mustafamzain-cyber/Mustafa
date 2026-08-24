export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(404, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(401, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(403, message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation error') {
        super(400, message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(409, message);
    }
}

export class ServerError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(500, message, false);
    }
}
