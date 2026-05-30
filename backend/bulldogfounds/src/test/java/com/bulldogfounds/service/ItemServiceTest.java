package com.bulldogfounds.service;

import com.bulldogfounds.dto.CreateItemRequest;
import com.bulldogfounds.dto.ItemResponse;
import com.bulldogfounds.dto.UpdateItemRequest;
import com.bulldogfounds.dto.UpdateItemStatusRequest;
import com.bulldogfounds.entity.ItemPost;
import com.bulldogfounds.entity.User;
import com.bulldogfounds.enums.ItemStatus;
import com.bulldogfounds.enums.UserRole;
import com.bulldogfounds.exception.ResourceNotFoundException;
import com.bulldogfounds.exception.UnauthorizedActionException;
import com.bulldogfounds.repository.ItemPostRepository;
import com.bulldogfounds.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ItemService.
 */
@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemPostRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ItemService itemService;

    private User testUser;
    private ItemPost testItem;
    private CreateItemRequest createRequest;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .role(UserRole.STUDENT)
                .teamsLink("https://teams.com/john")
                .build();

        // Setup test item
        testItem = ItemPost.builder()
                .id(1L)
                .title("Lost Keys")
                .color("Silver")
                .description("Lost my house keys near the library")
                .lastKnownLocation("Library")
                .claimLocation("Lost and Found Office")
                .additionalDetails("Key fob with blue strap")
                .status(ItemStatus.UNRESOLVED)
                .createdBy(testUser)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup create request
        createRequest = CreateItemRequest.builder()
                .title("Lost Keys")
                .color("Silver")
                .description("Lost my house keys near the library")
                .lastKnownLocation("Library")
                .claimLocation("Lost and Found Office")
                .additionalDetails("Key fob with blue strap")
                .build();
    }

    @Test
    void testCreateItemSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(itemRepository.save(any(ItemPost.class))).thenReturn(testItem);

        // Act
        ItemResponse response = itemService.createItem(1L, createRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Lost Keys");
        assertThat(response.getCreatedByName()).isEqualTo("John Doe");
        assertThat(response.getStatus()).isEqualTo(ItemStatus.UNRESOLVED);
        verify(userRepository).findById(1L);
        verify(itemRepository).save(any(ItemPost.class));
    }

    @Test
    void testCreateItemUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> itemService.createItem(999L, createRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testGetItemByIdSuccess() {
        // Arrange
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        // Act
        ItemResponse response = itemService.getItemById(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Lost Keys");
        verify(itemRepository).findById(1L);
    }

    @Test
    void testGetItemByIdNotFound() {
        // Arrange
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> itemService.getItemById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Item not found");
    }

    @Test
    void testGetAllItemsSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(itemRepository.findAll(pageable)).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.getAllItems(pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getTitle()).isEqualTo("Lost Keys");
        verify(itemRepository).findAll(pageable);
    }

    @Test
    void testSearchItemsSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(itemRepository.findByTitleContainingIgnoreCase("Lost", pageable)).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.searchItems("Lost", pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        verify(itemRepository).findByTitleContainingIgnoreCase("Lost", pageable);
    }

    @Test
    void testFilterByColorSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(itemRepository.findByColorContainingIgnoreCase("Silver", pageable)).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.filterByColor("Silver", pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        verify(itemRepository).findByColorContainingIgnoreCase("Silver", pageable);
    }

    @Test
    void testFilterByStatusSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(itemRepository.findByStatus(ItemStatus.UNRESOLVED, pageable)).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.filterByStatus(ItemStatus.UNRESOLVED, pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        verify(itemRepository).findByStatus(ItemStatus.UNRESOLVED, pageable);
    }

    @Test
    void testSearchAndFilterSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(itemRepository.findByTitleContainingIgnoreCaseAndColorContainingIgnoreCase(
                "Lost", "Silver", pageable
        )).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.searchAndFilter("Lost", "Silver", pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        verify(itemRepository).findByTitleContainingIgnoreCaseAndColorContainingIgnoreCase(
                "Lost", "Silver", pageable
        );
    }

    @Test
    void testGetUserItemsSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ItemPost> itemPage = new PageImpl<>(List.of(testItem), pageable, 1);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(itemRepository.findByCreatedByIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(itemPage);

        // Act
        Page<ItemResponse> response = itemService.getUserItems(1L, pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        verify(userRepository).findById(1L);
        verify(itemRepository).findByCreatedByIdOrderByCreatedAtDesc(1L, pageable);
    }

    @Test
    void testGetUserItemsUserNotFound() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> itemService.getUserItems(999L, pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testUpdateItemSuccess() {
        // Arrange
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .title("Updated Title")
                .description("Updated description")
                .build();
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(itemRepository.save(any(ItemPost.class))).thenReturn(testItem);

        // Act
        ItemResponse response = itemService.updateItem(1L, 1L, updateRequest);

        // Assert
        assertThat(response).isNotNull();
        verify(itemRepository).findById(1L);
        verify(itemRepository).save(any(ItemPost.class));
    }

    @Test
    void testUpdateItemNotFound() {
        // Arrange
        UpdateItemRequest updateRequest = UpdateItemRequest.builder().title("Updated").build();
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> itemService.updateItem(999L, 1L, updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Item not found");
    }

    @Test
    void testUpdateItemUnauthorized() {
        // Arrange
        UpdateItemRequest updateRequest = UpdateItemRequest.builder().title("Updated").build();
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        // Act & Assert
        assertThatThrownBy(() -> itemService.updateItem(1L, 999L, updateRequest))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("You can only update your own items");
    }

    @Test
    void testUpdateItemStatusSuccess() {
        // Arrange
        UpdateItemStatusRequest updateRequest = UpdateItemStatusRequest.builder()
                .status(ItemStatus.RESOLVED)
                .build();
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(itemRepository.save(any(ItemPost.class))).thenReturn(testItem);

        // Act
        ItemResponse response = itemService.updateItemStatus(1L, 1L, updateRequest);

        // Assert
        assertThat(response).isNotNull();
        verify(itemRepository).findById(1L);
        verify(itemRepository).save(any(ItemPost.class));
    }

    @Test
    void testUpdateItemStatusUnauthorized() {
        // Arrange
        UpdateItemStatusRequest updateRequest = UpdateItemStatusRequest.builder()
                .status(ItemStatus.RESOLVED)
                .build();
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        // Act & Assert
        assertThatThrownBy(() -> itemService.updateItemStatus(1L, 999L, updateRequest))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("You can only update status of your own items");
    }

    @Test
    void testDeleteItemSuccess() {
        // Arrange
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        // Act
        itemService.deleteItem(1L, 1L);

        // Assert
        verify(itemRepository).findById(1L);
        verify(itemRepository).deleteById(1L);
    }

    @Test
    void testDeleteItemNotFound() {
        // Arrange
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> itemService.deleteItem(999L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Item not found");
    }

    @Test
    void testDeleteItemUnauthorized() {
        // Arrange
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        // Act & Assert
        assertThatThrownBy(() -> itemService.deleteItem(1L, 999L))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("You can only delete your own items");
    }
}
