package com.bulldogfounds.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating item details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemRequest {

    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(min = 2, max = 100, message = "Color must be between 2 and 100 characters")
    private String color;

    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @Size(min = 3, max = 255, message = "Last known location must be between 3 and 255 characters")
    private String lastKnownLocation;

    @Size(min = 3, max = 255, message = "Claim location must be between 3 and 255 characters")
    private String claimLocation;

    @Size(max = 2000, message = "Additional details must not exceed 2000 characters")
    private String additionalDetails;
}
