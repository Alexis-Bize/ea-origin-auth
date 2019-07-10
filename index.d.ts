declare namespace EAOriginAuth {
    type AuthenticateSuccessResponse = {
        access_token: string;
        token_type: 'Bearer';
        expires_in: string | number;
    };

    type AuthenticateFailureResponse = {
        message: string;
        statusCode: number;
        reason: string;
    };

    type AuthenticateSuccessOutput = {
        success: true;
        response: AuthenticateSuccessResponse;
    };

    type AuthenticateFailureOutput = {
        success: false;
        response: AuthenticateFailureResponse;
    };

    type AuthenticateResponseOutput =
        | AuthenticateSuccessOutput
        | AuthenticateFailureOutput;

    function authenticate(
        email: string,
        password: string
    ): Promise<AuthenticateResponseOutput>;
}

export = EAOriginAuth;
