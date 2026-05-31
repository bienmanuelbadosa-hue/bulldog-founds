package com.bulldogfounds.service.impl;

import com.bulldogfounds.dto.CreateItemRequest;
import com.bulldogfounds.dto.ItemResponse;
import com.bulldogfounds.dto.UpdateItemRequest;
import com.bulldogfounds.dto.UpdateItemStatusRequest;
import com.bulldogfounds.entity.ItemPost;
import com.bulldogfounds.entity.User;
import com.bulldogfounds.enums.ItemStatus;
import com.bulldogfounds.exception.ResourceNotFoundException;
import com.bulldogfounds.exception.UnauthorizedActionException;
import com.bulldogfounds.repository.ItemPostRepository;
import com.bulldogfounds.repository.UserRepository;
import com.bulldogfounds.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Concrete implementation of {@link ItemService}.
 *
 * <p>Manages the full lifecycle of item posts: creation, retrieval, search,
 * filtering, update, status transitions, and deletion. All business rules
 * (such as ownership checks) are enforced here, not in the controller.
 *
 * <p><b>OOP — Abstraction:</b> Controllers reference {@link ItemService}
 * (the interface). The implementation is fully hidden from the controller layer.
 *
 * <p><b>SOLID — DIP:</b> {@link com.bulldogfounds.controller.ItemController}
 * depends on the {@link ItemService} abstraction, not this concrete class.
 *
 * <p><b>SOLID — SRP:</b> This class exclusively manages item post business logic.
 * File handling is delegated to {@link com.bulldogfounds.service.FileService}.
 *
 * <p><b>SOLID — DRY:</b> Entity-to-DTO mapping is centralised in
 * {@link #mapToResponse(ItemPost)} and reused across all read operations.
 *
 * <p><b>GRASP — Information Expert:</b> This class holds all information about
 * items and is the most appropriate place to perform item-related operations.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ItemServiceImpl implements ItemService {

    private final ItemPostRepository itemRepository;
    private final UserRepository userRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    public ItemResponse createItem(Long userId, CreateItemRequest request) {
        log.info("Creating new item post for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        ItemPost item = ItemPost.builder()
                .title(request.getTitle())
                .color(request.getColor())
                .description(request.getDescription())
                .lastKnownLocation(request.getLastKnownLocation())
                .claimLocation(request.getClaimLocation())
                .additionalDetails(request.getAdditionalDetails())
                .imageUrl(request.getImageUrl())
                .createdBy(user)
                .build();

        ItemPost savedItem = itemRepository.save(item);
        log.info("Item post created successfully with ID: {}", savedItem.getId());

        return mapToResponse(savedItem);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getAllItems(Pageable pageable) {
        log.debug("Fetching all items with pagination: {}", pageable);
        Page<ItemPost> items = itemRepository.findAll(pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long itemId) {
        log.debug("Fetching item with ID: {}", itemId);
        ItemPost item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.warn("Item not found with ID: {}", itemId);
                    return new ResourceNotFoundException("Item not found");
                });
        return mapToResponse(item);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> searchItems(String keyword, Pageable pageable) {
        log.debug("Searching items with keyword: {}", keyword);
        Page<ItemPost> items = itemRepository.findByTitleContainingIgnoreCase(keyword, pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> filterByColor(String color, Pageable pageable) {
        log.debug("Filtering items by color: {}", color);
        Page<ItemPost> items = itemRepository.findByColorContainingIgnoreCase(color, pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> filterByStatus(ItemStatus status, Pageable pageable) {
        log.debug("Filtering items by status: {}", status);
        Page<ItemPost> items = itemRepository.findByStatus(status, pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> searchAndFilter(String keyword, String color, Pageable pageable) {
        log.debug("Searching items with keyword: {} and color: {}", keyword, color);
        Page<ItemPost> items = itemRepository
                .findByTitleContainingIgnoreCaseAndColorContainingIgnoreCase(keyword, color, pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getUserItems(Long userId, Pageable pageable) {
        log.debug("Fetching items for user: {}", userId);

        userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        Page<ItemPost> items = itemRepository.findByCreatedByIdOrderByCreatedAtDesc(userId, pageable);
        return mapToResponsePage(items);
    }

    /**
     * {@inheritDoc}
     *
     * @throws UnauthorizedActionException if the user does not own the item
     */
    @Override
    public ItemResponse updateItem(Long itemId, Long userId, UpdateItemRequest request) {
        log.info("Updating item {} by user {}", itemId, userId);

        ItemPost item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.warn("Item not found with ID: {}", itemId);
                    return new ResourceNotFoundException("Item not found");
                });

        // Ownership check — only the item creator may update it
        if (!item.getCreatedBy().getId().equals(userId)) {
            log.warn("User {} attempted to update item they don't own", userId);
            throw new UnauthorizedActionException("You can only update your own items");
        }

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getColor() != null) item.setColor(request.getColor());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getLastKnownLocation() != null) item.setLastKnownLocation(request.getLastKnownLocation());
        if (request.getClaimLocation() != null) item.setClaimLocation(request.getClaimLocation());
        if (request.getAdditionalDetails() != null) item.setAdditionalDetails(request.getAdditionalDetails());

        ItemPost updatedItem = itemRepository.save(item);
        log.info("Item {} updated successfully", itemId);

        return mapToResponse(updatedItem);
    }

    /**
     * {@inheritDoc}
     *
     * @throws UnauthorizedActionException if the user does not own the item
     */
    @Override
    public ItemResponse updateItemStatus(Long itemId, Long userId, UpdateItemStatusRequest request) {
        log.info("Updating status of item {} to {} by user {}", itemId, request.getStatus(), userId);

        ItemPost item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.warn("Item not found with ID: {}", itemId);
                    return new ResourceNotFoundException("Item not found");
                });

        // Ownership check — only the item creator may change the status
        if (!item.getCreatedBy().getId().equals(userId)) {
            log.warn("User {} attempted to update status of item they don't own", userId);
            throw new UnauthorizedActionException("You can only update status of your own items");
        }

        item.setStatus(request.getStatus());
        ItemPost updatedItem = itemRepository.save(item);
        log.info("Item {} status updated to {}", itemId, request.getStatus());

        return mapToResponse(updatedItem);
    }

    /**
     * {@inheritDoc}
     *
     * @throws UnauthorizedActionException if the user does not own the item
     */
    @Override
    public void deleteItem(Long itemId, Long userId) {
        log.info("Deleting item {} by user {}", itemId, userId);

        ItemPost item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.warn("Item not found with ID: {}", itemId);
                    return new ResourceNotFoundException("Item not found");
                });

        // Ownership check — only the item creator may delete it
        if (!item.getCreatedBy().getId().equals(userId)) {
            log.warn("User {} attempted to delete item they don't own", userId);
            throw new UnauthorizedActionException("You can only delete your own items");
        }

        itemRepository.deleteById(itemId);
        log.info("Item {} deleted successfully", itemId);
    }

    /**
     * Map a single {@link ItemPost} entity to an {@link ItemResponse} DTO.
     *
     * <p><b>DRY:</b> Centralised mapping logic reused by all read operations.
     *
     * @param item the item post entity
     * @return item response DTO
     */
    private ItemResponse mapToResponse(ItemPost item) {
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .color(item.getColor())
                .description(item.getDescription())
                .lastKnownLocation(item.getLastKnownLocation())
                .claimLocation(item.getClaimLocation())
                .additionalDetails(item.getAdditionalDetails())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .createdById(item.getCreatedBy().getId())
                .createdByName(item.getCreatedBy().getFullName())
                .createdByEmail(item.getCreatedBy().getEmail())
                .createdByTeamsLink(item.getCreatedBy().getTeamsLink())
                .build();
    }

    /**
     * Map a {@link Page} of {@link ItemPost} entities to a {@link Page} of {@link ItemResponse} DTOs.
     *
     * @param itemPage page of item post entities
     * @return page of item response DTOs
     */
    private Page<ItemResponse> mapToResponsePage(Page<ItemPost> itemPage) {
        List<ItemResponse> responses = itemPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .toList();
        return new PageImpl<>(responses, itemPage.getPageable(), itemPage.getTotalElements());
    }
}
