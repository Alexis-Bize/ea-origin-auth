import * as request from 'request';
import { EAOriginAuthError, errors } from './errors';
import { stringify } from 'querystring';

import {
    AuthenticateResponseOutput,
    AuthenticateSuccessResponse,
    AuthenticateFailureOutput
} from '..';

// **** TYPINGS **** //

type RequestHeaders = {
    [key: string]: string | number;
};

type PreAuthResponse = {
    selflocation: string;
    cookieString: string;
};

type UserCredentials = {
    email: string;
    password: string;
};

// **** DEFINITIONS *** //

const USER_AGENT: string = [
    'Mozilla/5.0 (Zeny; EA-Origin-Auth/1.0)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/71.0.3578.98 Safari/537.36'
].join(' ');

const BASE_HEADERS: RequestHeaders = {
    Accept: '*/*',
    'Accept-Language': 'en-US',
    'User-Agent': USER_AGENT
};

const EA_ENDPOINTS = {
    sessionId:
        'https://accounts.ea.com/connect/auth?response_type=code&client_id=ORIGIN_SPA_ID&display=originXWeb%2Flogin&locale=en_US&release_type=prod&redirect_uri=https%3A%2F%2Fwww.origin.com%2Fviews%2Flogin.html',
    authenticate:
        'https://accounts.ea.com/connect/auth?client_id=ORIGIN_JS_SDK&response_type=token&redirect_uri=nucleus%3Arest&prompt=none&release_type=prod'
};

// **** PRIVATE METHODS *** //

const _rand = (outputLength = 32) => {
    const output: string[] = [];
    const characters =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charLength = characters.length;

    for (let i = 0, l = outputLength; i < l; ++i) {
        output.push(characters.charAt(Math.floor(Math.random() * charLength)));
    }

    return output.join('');
};

const _preAuth = (): Promise<PreAuthResponse> =>
    new Promise((resolve, reject) => {
        const jar = request.jar();
        request(
            {
                uri: EA_ENDPOINTS.sessionId,
                headers: BASE_HEADERS,
                jar
            },
            (err: Error | void, res: request.Response) => {
                if (err) return reject(errors.internal(err.message));

                const selflocation = String(res.headers['selflocation'] || '');
                const cookieString = jar.getCookieString(selflocation);

                return cookieString.length !== 0
                    ? resolve({ cookieString, selflocation })
                    : reject(errors.internal());
            }
        );
    });

const _logUser = (
    preAuthResponse: PreAuthResponse,
    credentials: UserCredentials
): Promise<string> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: preAuthResponse.selflocation,
                method: 'POST',
                followRedirect: false,
                headers: {
                    ...BASE_HEADERS,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: preAuthResponse.cookieString
                },
                body: stringify({
                    email: credentials.email,
                    password: credentials.password,
                    _eventId: 'submit',
                    cid: _rand(),
                    showAgeUp: true,
                    googleCaptchaResponse: '',
                    _rememberMe: 'on'
                })
            },
            (err: Error | void, _: request.Response, body: any) => {
                if (err) return reject(errors.internal(err.message));

                const matchRedirect = body.match(/window\.location = \"(.*)\"/);

                if (matchRedirect === null || matchRedirect[1] === void 0)
                    return reject(errors.invalidCredentials());
                else resolve(matchRedirect[1]);
            }
        );
    });

const _getAuthenticationCookie = (
    logUserResponseUri: string
): Promise<string> =>
    new Promise((resolve, reject) => {
        const jar = request.jar();
        request(
            {
                uri: logUserResponseUri,
                method: 'GET',
                followRedirect: false,
                headers: BASE_HEADERS,
                jar
            },
            (err: Error | void, res: request.Response) => {
                if (err) return reject(errors.internal(err.message));

                const location = res.headers.location || '';
                const matchCode = location.match(/code=(.*)/);

                if (matchCode === null || matchCode[1] === void 0)
                    return reject(errors.matchError());

                const cookieString = jar.getCookieString(logUserResponseUri);

                return cookieString.length !== 0
                    ? resolve(cookieString)
                    : reject(errors.internal());
            }
        );
    });

const _authenticateWithCookie = (
    cookieString: string
): Promise<AuthenticateSuccessResponse> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: EA_ENDPOINTS.authenticate,
                method: 'GET',
                headers: {
                    ...BASE_HEADERS,
                    Cookie: cookieString
                }
            },
            (err: Error | void, _: request.Response, body: any) =>
                err
                    ? reject(errors.internal(err.message))
                    : resolve(JSON.parse(body) as AuthenticateSuccessResponse)
        );
    });

const _processAuthentication = async (
    email: string,
    password: string
): Promise<AuthenticateResponseOutput> => ({
    success: true,
    response: await _authenticateWithCookie(
        await _getAuthenticationCookie(
            await _logUser(await _preAuth(), {
                email,
                password
            })
        )
    )
});

const _onAuthenticationError = (
    err: Error | EAOriginAuthError
): AuthenticateFailureOutput => {
    const error = !(err instanceof EAOriginAuthError)
        ? errors.internal(err.message)
        : err;

    return {
        success: false,
        response: {
            message: error.message,
            statusCode: error.extra.statusCode,
            reason: error.extra.reason
        }
    };
};

// **** PUBLIC METHODS *** //

export const authenticate = async (
    email: string,
    password: string
): Promise<AuthenticateResponseOutput> =>
    _processAuthentication(email, password).catch(_onAuthenticationError);
