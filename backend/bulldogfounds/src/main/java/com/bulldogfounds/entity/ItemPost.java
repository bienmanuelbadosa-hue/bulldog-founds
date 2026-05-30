package com.bulldogfounds.entity;

import com.bulldogfounds.enums.ItemStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ItemPost entity representing lost/found item posts.
 * 
 * Responsibilities:
 * - Store item post information
 * - Track item status and ownership
 * - Maintain posting metadata
 */
@Entity
@Table(name = "item_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Color is required")
    @Size(min = 2, max = 100, message = "Color must be between 2 and 100 characters")
    @Column(name = "color", nullable = false)
    private String color;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Last known location is required")
    @Size(min = 3, max = 255, message = "Last known location must be between 3 and 255 characters")
    @Column(name = "last_known_location", nullable = false)
    private String lastKnownLocation;

    @NotBlank(message = "Claim location is required")
    @Size(min = 3, max = 255, message = "Claim location must be between 3 and 255 characters")
    @Column(name = "claim_location", nullable = false)
    private String claimLocation;

    @Column(name = "additional_details", columnDefinition = "TEXT")
    private String additionalDetails;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ItemStatus status = ItemStatus.UNRESOLVED;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /**
     * Update the timestamp when the entity is updated.
     * Called before persisting updates to database.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
