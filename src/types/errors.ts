/**
 * TadoError extends the base Error class to represent errors specific to the Tado ecosystem.
 * This custom error class can be used to differentiate between general errors
 * and those that are Tado-specific, enabling more precise error handling and debugging.
 */
export class TadoError extends Error {}

/**
 * Authentication Errors will use this class
 */
export class AuthError extends TadoError {}

/*
 * The refresh token provided has either expired or is incorrect
 */
export class InvalidRefreshToken extends AuthError {}

/*
 * You cannot yet make API calls because the `authenticate` method
 * hasn't been successfully called
 */
export class NotAuthenticated extends AuthError {}

/*
 * Timeout while waiting for device auth to complete
 */
export class AuthTimeout extends AuthError {}
