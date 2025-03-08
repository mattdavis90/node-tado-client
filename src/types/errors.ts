/**
 * TadoError extends the base Error class to represent errors specific to the Tado ecosystem.
 * This custom error class can be used to differentiate between general errors
 * and those that are Tado-specific, enabling more precise error handling and debugging.
 */
export class TadoError extends Error {}

export class AuthError extends TadoError {}

export class InvalidRefreshToken extends AuthError {}

export class NotAuthenticated extends AuthError {}

export class AuthTimeout extends AuthError {}
