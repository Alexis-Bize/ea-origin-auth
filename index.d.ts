declare namespace EAOriginAuth {
    type AuthenticateResponse = {
        access_token: string;
        token_type: 'Bearer';
        expires_in: string | number;
    };

    function authenticate(
        email: string,
        password: string
    ): Promise<AuthenticateResponse>;
}

export = EAOriginAuth;
