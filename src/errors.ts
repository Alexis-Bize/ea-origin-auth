// **** TYPINGS **** //

type ExtraErrorProperties = {
    statusCode: number;
    reason: string;
};

// **** PUBLIC METHODS **** //

export class EAOriginAuthError extends Error {
    readonly EAOriginAuthError = true;
    readonly extra: ExtraErrorProperties;

    constructor(message: string, extra: ExtraErrorProperties) {
        super(message);
        Error.captureStackTrace(this, EAOriginAuthError);
        this.name = this.constructor.name;
        this.extra = extra;
    }
}

export const errors = {
    internal: (message = 'Something went wrong...') =>
        new EAOriginAuthError(message, {
            statusCode: 500,
            reason: 'INTERNAL_ERROR'
        }),
    matchError: (message = 'Could not match required parameters') =>
        new EAOriginAuthError(message, {
            statusCode: 400,
            reason: 'MATCH_ERROR'
        }),
    invalidCredentials: (message = 'Invalid credentials or 2FA enabled') =>
        new EAOriginAuthError(message, {
            statusCode: 401,
            reason: 'INVALID_CREDENTIALS'
        })
};
