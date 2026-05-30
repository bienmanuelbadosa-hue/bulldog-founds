package com.bulldogfounds.exception;

/**
 * Exception thrown when user attempts an unauthorized action.
 */
public class UnauthorizedActionException extends RuntimeException {

    public UnauthorizedActionException(String message) {
        super(message);
    }

    public UnauthorizedActionException(String message, Throwable cause) {
        super(message, cause);
    }
}
