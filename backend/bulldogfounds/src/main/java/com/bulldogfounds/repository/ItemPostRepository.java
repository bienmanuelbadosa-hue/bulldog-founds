package com.bulldogfounds.repository;

import com.bulldogfounds.entity.ItemPost;
import com.bulldogfounds.enums.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ItemPost entity.
 * 
 * Provides database access methods for item-related operations.
 */
@Repository
public interface ItemPostRepository extends JpaRepository<ItemPost, Long> {

    /**
     * Find items by title containing the keyword (case-insensitive).
     * 
     * @param keyword the search keyword
     * @param pageable pagination information
     * @return Page of items matching the keyword
     */
    Page<ItemPost> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    /**
     * Find items by color (case-insensitive).
     * 
     * @param color the item color
     * @param pageable pagination information
     * @return Page of items matching the color
     */
    Page<ItemPost> findByColorContainingIgnoreCase(String color, Pageable pageable);

    /**
     * Find items by status.
     * 
     * @param status the item status
     * @param pageable pagination information
     * @return Page of items with the given status
     */
    Page<ItemPost> findByStatus(ItemStatus status, Pageable pageable);

    /**
     * Find items by user (creator).
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return Page of items created by the user
     */
    Page<ItemPost> findByCreatedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find items by multiple criteria with combined search.
     * 
     * @param keyword the search keyword
     * @param color the item color
     * @param pageable pagination information
     * @return Page of items matching both criteria
     */
    Page<ItemPost> findByTitleContainingIgnoreCaseAndColorContainingIgnoreCase(
            String keyword,
            String color,
            Pageable pageable
    );
}
