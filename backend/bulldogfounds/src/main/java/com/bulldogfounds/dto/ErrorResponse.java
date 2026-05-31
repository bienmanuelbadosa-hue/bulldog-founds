package com.bulldogfounds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized response DTO representing an API error.
 *
 * <p>Separated from exception handlers to follow the Single Responsibility Principle (SRP)
 * and DTO design patterns.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private String error;
    private Map<String, String> validationErrors;
}
