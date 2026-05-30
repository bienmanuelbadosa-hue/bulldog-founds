package com.bulldogfounds.controller;

import com.bulldogfounds.dto.CreateItemRequest;
import com.bulldogfounds.dto.ItemResponse;
import com.bulldogfounds.dto.UpdateItemRequest;
import com.bulldogfounds.dto.UpdateItemStatusRequest;
import com.bulldogfounds.enums.ItemStatus;
import com.bulldogfounds.service.FileService;
import com.bulldogfounds.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * REST Controller for item management endpoints.
 * 
 * Handles:
 * - Creating item posts
 * - Retrieving items with search and filtering
 * - Updating items and status
 * - Deleting items
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    private final ItemService itemService;
    private final FileService fileService;

    /**
     * Create a new item post with optional file upload.
     * Supports multipart/form-data with image file.
     * 
     * @param title item title
     * @param color item color
     * @param description item description
     * @param lastKnownLocation last known location
     * @param claimLocation claim location
     * @param additionalDetails additional details (optional)
     * @param imageFile image file (optional)
     * @param authentication current authenticated user
     * @return created item response
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ItemResponse> createItemWithFile(
            @RequestParam String title,
            @RequestParam String color,
            @RequestParam String description,
            @RequestParam String lastKnownLocation,
            @RequestParam String claimLocation,
            @RequestParam(required = false) String additionalDetails,
            @RequestParam(required = false) MultipartFile imageFile,
            Authentication authentication
    ) throws IOException {
        log.info("POST /api/items (multipart) - Creating item for user: {}", authentication.getName());
        
        Long userId = extractUserIdFromAuth(authentication);
        
        // Build request object
        CreateItemRequest request = CreateItemRequest.builder()
                .title(title)
                .color(color)
                .description(description)
                .lastKnownLocation(lastKnownLocation)
                .claimLocation(claimLocation)
                .additionalDetails(additionalDetails)
                .build();
        
        // Handle file upload
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileService.saveFile(imageFile);
        }
        
        ItemResponse response = itemService.createItem(userId, request);
        if (imageUrl != null) {
            response.setImageUrl(imageUrl);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Create a new item post (JSON request).
     * 
     * @param request item creation details
     * @param authentication current authenticated user
     * @return created item response
     */
    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<ItemResponse> createItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication
    ) {
        log.info("POST /api/items (JSON) - Creating item for user: {}", authentication.getName());
        
        // Extract user ID from authentication (email is the principal)
        Long userId = extractUserIdFromAuth(authentication);
        ItemResponse response = itemService.createItem(userId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all items with pagination.
     * 
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (ASC/DESC)
     * @return paginated items
     */
    @GetMapping
    public ResponseEntity<Page<ItemResponse>> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection
    ) {
        log.info("GET /api/items - Fetching items page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ItemResponse> items = itemService.getAllItems(pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Get item by ID.
     * 
     * @param id the item ID
     * @return item details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        log.info("GET /api/items/{} - Fetching item details", id);
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    /**
     * Search items by keyword.
     * 
     * @param keyword search keyword
     * @param page page number
     * @param size page size
     * @return matching items
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ItemResponse>> searchItems(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/items/search - Searching with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ItemResponse> items = itemService.searchItems(keyword, pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Filter items by color.
     * 
     * @param color color filter
     * @param page page number
     * @param size page size
     * @return filtered items
     */
    @GetMapping("/filter/color")
    public ResponseEntity<Page<ItemResponse>> filterByColor(
            @RequestParam String color,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/items/filter/color - Filtering by color: {}", color);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ItemResponse> items = itemService.filterByColor(color, pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Filter items by status.
     * 
     * @param status status filter
     * @param page page number
     * @param size page size
     * @return filtered items
     */
    @GetMapping("/filter/status")
    public ResponseEntity<Page<ItemResponse>> filterByStatus(
            @RequestParam ItemStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/items/filter/status - Filtering by status: {}", status);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ItemResponse> items = itemService.filterByStatus(status, pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Search and filter items by keyword and color.
     * 
     * @param keyword search keyword
     * @param color color filter
     * @param page page number
     * @param size page size
     * @return filtered items
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<Page<ItemResponse>> searchAndFilter(
            @RequestParam String keyword,
            @RequestParam String color,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/items/search/advanced - Keyword: {}, Color: {}", keyword, color);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ItemResponse> items = itemService.searchAndFilter(keyword, color, pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Get items posted by the current user.
     * 
     * @param page page number
     * @param size page size
     * @param authentication current authenticated user
     * @return user's items
     */
    @GetMapping("/my-items")
    public ResponseEntity<Page<ItemResponse>> getUserItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        log.info("GET /api/items/my-items - Fetching items for user: {}", authentication.getName());
        
        Long userId = extractUserIdFromAuth(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ItemResponse> items = itemService.getUserItems(userId, pageable);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Update item details.
     * 
     * @param id the item ID
     * @param request update details
     * @param authentication current authenticated user
     * @return updated item
     */
    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemRequest request,
            Authentication authentication
    ) {
        log.info("PUT /api/items/{} - Updating item for user: {}", id, authentication.getName());
        
        Long userId = extractUserIdFromAuth(authentication);
        ItemResponse response = itemService.updateItem(id, userId, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update item status.
     * 
     * @param id the item ID
     * @param request new status
     * @param authentication current authenticated user
     * @return updated item
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ItemResponse> updateItemStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemStatusRequest request,
            Authentication authentication
    ) {
        log.info("PATCH /api/items/{}/status - Updating status to {} for user: {}", 
                id, request.getStatus(), authentication.getName());
        
        Long userId = extractUserIdFromAuth(authentication);
        ItemResponse response = itemService.updateItemStatus(id, userId, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an item post.
     * Deletes associated image file if it exists.
     * 
     * @param id the item ID
     * @param authentication current authenticated user
     * @return no content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        log.info("DELETE /api/items/{} - Deleting item for user: {}", id, authentication.getName());
        
        Long userId = extractUserIdFromAuth(authentication);
        
        // Get item details to retrieve image URL before deletion
        ItemResponse item = itemService.getItemById(id);
        if (item.getImageUrl() != null) {
            fileService.deleteFile(item.getImageUrl());
        }
        
        itemService.deleteItem(id, userId);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Extract user ID from authentication.
     * In JWT auth, the principal is the user's email.
     * 
     * @param authentication the authentication object
     * @return user ID (placeholder - should be fetched from database in real implementation)
     */
    private Long extractUserIdFromAuth(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        log.debug("Extracting user ID from email: {}", email);
        // In a real implementation, fetch user ID from database using email
        // For now, return a placeholder
        return 1L; // TODO: Implement proper user ID extraction
    }
}
