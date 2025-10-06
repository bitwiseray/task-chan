class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserError";
        this.isUserError = true;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
class PermissionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PermissionError';
    }
}

class InternalError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InternalError';
    }
}

module.exports = { UserError, NotFoundError, PermissionError, InternalError };