package com.bulldogfounds.dto;

import com.bulldogfounds.enums.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for item post response.
 * Returned when fetching item details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {

    private Long id;
    private String title;
    private String color;
    private String description;
    private String lastKnownLocation;
    private String claimLocation;
    private String additionalDetails;
    private String imageUrl;
    private ItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String createdByTeamsLink;
}
