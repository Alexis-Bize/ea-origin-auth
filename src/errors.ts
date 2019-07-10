// **** TYPINGS **** //

type ExtraErrorProperties = {
    statusCode?: number;
    reason?: string;
};

// **** CLASS **** //

class EAOriginAuthError extends Error {
    extra: ExtraErrorProperties;

    constructor(message: string, extra: ExtraErrorProperties) {
        super(message);
        Error.captureStackTrace(this, EAOriginAuthError);
        this.name = this.constructor.name;
        this.extra = extra;
    }
}

// **** DEFINITIONS **** //

const errors = {
    internal: (message = 'Something went wrong...') =>
        new EAOriginAuthError(message, {
            statusCode: 500,
            reason: 'INTERNAL_ERROR'
        }),
    matchError: (message = 'Match error') =>
        new EAOriginAuthError(message, {
            statusCode: 400,
            reason: 'MATCH_ERROR'
        }),
    invalidCredentials: (message = 'Invalid credentials') =>
        new EAOriginAuthError(message, {
            statusCode: 401,
            reason: 'INVALID_CREDENTIALS'
        })
};

// **** PUBLIC METHODS **** //

export = errors;
