package com.bulldogfounds.service;

import com.bulldogfounds.dto.ItemResponse;
import com.bulldogfounds.dto.CreateItemRequest;
import com.bulldogfounds.dto.UpdateItemRequest;
import com.bulldogfounds.dto.UpdateItemStatusRequest;
import com.bulldogfounds.enums.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for item post management operations.
 *
 * <p>Abstraction layer between ItemController and the concrete implementation.
 * Controllers depend on this interface, not the implementation, following the
 * Dependency Inversion Principle (DIP) and Interface Segregation Principle (ISP).
 *
 * <p>GRASP: Information Expert — this interface defines the contract for all
 * item-related knowledge and operations in the system.
 */
public interface ItemService {

    /**
     * Create a new item post.
     *
     * @param userId  the ID of the user creating the post
     * @param request item creation details
     * @return created item response
     */
    ItemResponse createItem(Long userId, CreateItemRequest request);

    /**
     * Get all items with pagination.
     *
     * @param pageable pagination information
     * @return page of item responses
     */
    Page<ItemResponse> getAllItems(Pageable pageable);

    /**
     * Get a single item by its ID.
     *
     * @param itemId the item ID
     * @return item response
     */
    ItemResponse getItemById(Long itemId);

    /**
     * Search items by title keyword.
     *
     * @param keyword  search keyword
     * @param pageable pagination information
     * @return page of matching items
     */
    Page<ItemResponse> searchItems(String keyword, Pageable pageable);

    /**
     * Filter items by color.
     *
     * @param color    color filter value
     * @param pageable pagination information
     * @return page of matching items
     */
    Page<ItemResponse> filterByColor(String color, Pageable pageable);

    /**
     * Filter items by status.
     *
     * @param status   status filter value
     * @param pageable pagination information
     * @return page of matching items
     */
    Page<ItemResponse> filterByStatus(ItemStatus status, Pageable pageable);

    /**
     * Search and filter items by keyword and color simultaneously.
     *
     * @param keyword  search keyword
     * @param color    color filter
     * @param pageable pagination information
     * @return page of matching items
     */
    Page<ItemResponse> searchAndFilter(String keyword, String color, Pageable pageable);

    /**
     * Get all items posted by a specific user.
     *
     * @param userId   the user ID
     * @param pageable pagination information
     * @return page of user's items
     */
    Page<ItemResponse> getUserItems(Long userId, Pageable pageable);

    /**
     * Update item details (ownership enforced).
     *
     * @param itemId  the item ID
     * @param userId  the authenticated user's ID
     * @param request update details
     * @return updated item response
     */
    ItemResponse updateItem(Long itemId, Long userId, UpdateItemRequest request);

    /**
     * Update item status (ownership enforced).
     *
     * @param itemId  the item ID
     * @param userId  the authenticated user's ID
     * @param request new status
     * @return updated item response
     */
    ItemResponse updateItemStatus(Long itemId, Long userId, UpdateItemStatusRequest request);

    /**
     * Delete an item post (ownership enforced).
     *
     * @param itemId the item ID
     * @param userId the authenticated user's ID
     */
    void deleteItem(Long itemId, Long userId);
}
