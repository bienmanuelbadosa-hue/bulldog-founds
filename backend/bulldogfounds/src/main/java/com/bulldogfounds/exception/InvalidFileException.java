package com.bulldogfounds.exception;

/**
 * Exception thrown when a file upload fails validation.
 *
 * Thrown by FileService when:
 * - File exceeds the size limit
 * - File type is not allowed
 * - File is null or empty
 */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }
}
