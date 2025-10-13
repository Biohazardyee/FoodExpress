export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequest extends ApiError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

export class Unauthorized extends ApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

export class Forbidden extends ApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

export class NotFound extends ApiError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

export class InternalError extends ApiError {
    constructor(message = 'Internal Server Error') {
        super(message, 500);
    }
}