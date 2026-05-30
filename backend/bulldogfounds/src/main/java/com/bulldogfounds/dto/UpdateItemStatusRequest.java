package com.bulldogfounds.dto;

import com.bulldogfounds.enums.ItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating item status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemStatusRequest {

    @NotNull(message = "Status is required")
    private ItemStatus status;
}
