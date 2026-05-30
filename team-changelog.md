# Bulldog Founds — Team Changelog

## [2026-05-29] Item Management Implementation (Phase 3) — Acosta

### Added

#### Item Management Features
- **Services:**
  - `ItemService.java` — Complete CRUD operations:
    - Create items (createItem)
    - Get all items with pagination (getAllItems)
    - Get item by ID (getItemById)
    - Search items by keyword (searchItems)
    - Filter by color (filterByColor)
    - Filter by status (filterByStatus)
    - Combined search & filter (searchAndFilter)
    - Get user's items (getUserItems)
    - Update item details (updateItem)
    - Update item status (updateItemStatus)
    - Delete item (deleteItem)

- **Controllers:**
  - `ItemController.java` — REST API endpoints:
    - POST /api/items — Create item
    - GET /api/items — List all items with pagination
    - GET /api/items/{id} — Get item details
    - GET /api/items/search — Search by keyword
    - GET /api/items/filter/color — Filter by color
    - GET /api/items/filter/status — Filter by status
    - GET /api/items/search/advanced — Combined search/filter
    - GET /api/items/my-items — Get user's items
    - PUT /api/items/{id} — Update item
    - PATCH /api/items/{id}/status — Update status
    - DELETE /api/items/{id} — Delete item

- **DTOs:**
  - `CreateItemRequest.java` — Create item DTO with validation
  - `ItemResponse.java` — Item details response with full metadata
  - `UpdateItemRequest.java` — Update item DTO (optional fields)
  - `UpdateItemStatusRequest.java` — Update status DTO

- **Tests:**
  - `ItemServiceTest.java` — 19 unit tests covering:
    - ✅ Create item (success, user not found)
    - ✅ Get item by ID (success, not found)
    - ✅ Get all items (pagination)
    - ✅ Search items
    - ✅ Filter by color, status
    - ✅ Search & filter combined
    - ✅ Get user items
    - ✅ Update item (success, not found, unauthorized)
    - ✅ Update status (success, unauthorized)
    - ✅ Delete item (success, not found, unauthorized)

### Key Features
✅ **Pagination** — All list endpoints support page, size, sort
✅ **Authorization** — Only item owners can modify/delete
✅ **Search & Filter** — Keyword search, color filter, status filter, combined
✅ **Validation** — Input validation on all DTOs
✅ **Exception Handling** — Proper error responses
✅ **Logging** — Comprehensive logging for debugging
✅ **Performance** — Read-only transactions for queries

### Engineering Principles Applied
✅ Thin Controllers — Controllers route and validate only  
✅ Business Logic in Services — All CRUD in ItemService  
✅ DTO Pattern — Clean entity/DTO separation  
✅ SRP — Each method has single responsibility  
✅ Authorization Checks — Ownership validation before updates  
✅ Consistent Error Handling — Uses GlobalExceptionHandler  
✅ Readable Code — Clear method names and logic  
✅ Proper Transactions — @Transactional on service methods  

### Test Results
- ✅ 19/19 ItemService tests passing
- ✅ Total test suite: 32/32 tests passing
- ✅ All phases (Auth + JWT + Item) working together

### MVP Completion Status
| Feature | Status | Tests |
|---------|--------|-------|
| Authentication | ✅ | 6 |
| JWT Security | ✅ | 7 |
| Item CRUD | ✅ | 19 |
| **File Upload** | **✅** | **9** |
| **Total** | **✅ READY** | **41** |

### What's Next (MVP Priorities)
1. ✅ Authentication (DONE)
2. ✅ Item Management (DONE)
3. ✅ **Image Upload** — File handling for item images (DONE)
4. ⬅️ **Frontend Integration** — React TypeScript UI
5. ⬅️ **Search Optimization** — Elasticsearch or full-text search

### API Examples

```bash
# Create item
POST /api/items
Authorization: Bearer <jwt-token>
{
  "title": "Lost Keys",
  "color": "Silver",
  "description": "Lost near the library",
  "lastKnownLocation": "Library",
  "claimLocation": "Lost and Found",
  "additionalDetails": "Blue strap"
}

# Search items
GET /api/items/search?keyword=keys&page=0&size=10

# Filter by status
GET /api/items/filter/status?status=UNRESOLVED&page=0&size=10

# Update item status
PATCH /api/items/1/status
{
  "status": "RESOLVED"
}
```

---

## [2026-05-29] Image Upload Implementation (Phase 4) — Acosta

### Added

#### File Upload Features
- **Services:**
  - `FileService.java` — File handling service:
    - `saveFile(MultipartFile)` — Save uploaded file with unique filename
    - `deleteFile(String filePath)` — Delete file by path
    - File validation: size (max 5MB), type (JPEG, PNG, GIF, WebP)

- **Controllers:**
  - `ItemController.java` — Enhanced endpoints:
    - `POST /api/items` (multipart) — Create item with optional file upload
    - `POST /api/items` (JSON) — Create item without file
    - `DELETE /api/items/{id}` — Enhanced to delete associated images

- **Configuration:**
  - Updated `application.properties`:
    - `file.upload-dir=./uploads` — Local storage directory
    - `spring.servlet.multipart.max-file-size=5MB`
    - `spring.servlet.multipart.max-request-size=5MB`

- **Tests:**
  - `FileServiceTest.java` — 9 unit tests covering:
    - ✅ Save file (JPEG, PNG, GIF, WebP)
    - ✅ File validation (size, type)
    - ✅ Delete file (existing, non-existent)
    - ✅ Error handling (null, empty, invalid type)

### Modified

- **ItemController.java:**
  - Added FileService dependency injection
  - Implemented multipart/form-data endpoint for file uploads
  - Updated DELETE to clean up associated image files
  - Maintains backward compatibility with JSON-only requests

### API Examples

```bash
# Create item with file upload (multipart)
POST /api/items
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Form data:
- title: "Lost Wallet"
- color: "Brown"
- description: "Lost at the student center on May 29"
- lastKnownLocation: "Student Center"
- claimLocation: "Office"
- additionalDetails: "Has student ID inside"
- imageFile: <binary file, max 5MB>

# Create item without file (JSON)
POST /api/items
Content-Type: application/json
Authorization: Bearer <jwt-token>
{
  "title": "Lost Keys",
  "color": "Silver",
  "description": "Lost near the library",
  "lastKnownLocation": "Library",
  "claimLocation": "Lost and Found",
  "additionalDetails": "Blue strap"
}

# Delete item (including associated image)
DELETE /api/items/1
Authorization: Bearer <jwt-token>
```

---

## [2026-05-29] Item Management Implementation (Phase 3) — Acosta

### Added

#### Item Management Features
- **Services:**
  - `ItemService.java` — Complete CRUD operations:
    - Create items (createItem)
    - Get all items with pagination (getAllItems)
    - Get item by ID (getItemById)
    - Search items by keyword (searchItems)
    - Filter by color (filterByColor)
    - Filter by status (filterByStatus)
    - Combined search & filter (searchAndFilter)
    - Get user's items (getUserItems)
    - Update item details (updateItem)
    - Update item status (updateItemStatus)
    - Delete item (deleteItem)

- **Controllers:**
  - `ItemController.java` — REST API endpoints:
    - POST /api/items — Create item
    - GET /api/items — List all items with pagination
    - GET /api/items/{id} — Get item details
    - GET /api/items/search — Search by keyword
    - GET /api/items/filter/color — Filter by color
    - GET /api/items/filter/status — Filter by status
    - GET /api/items/search/advanced — Combined search/filter
    - GET /api/items/my-items — Get user's items
    - PUT /api/items/{id} — Update item
    - PATCH /api/items/{id}/status — Update status
    - DELETE /api/items/{id} — Delete item

- **DTOs:**
  - `CreateItemRequest.java` — Create item DTO with validation
  - `ItemResponse.java` — Item details response with full metadata
  - `UpdateItemRequest.java` — Update item DTO (optional fields)
  - `UpdateItemStatusRequest.java` — Update status DTO

- **Tests:**
  - `ItemServiceTest.java` — 19 unit tests covering:
    - ✅ Create item (success, user not found)
    - ✅ Get item by ID (success, not found)
    - ✅ Get all items (pagination)
    - ✅ Search items
    - ✅ Filter by color, status
    - ✅ Search & filter combined
    - ✅ Get user items

### Added

#### Phase 1: Core Entities
- **Enums:**
  - `UserRole.java` — STUDENT, FACULTY, STAFF roles
  - `ItemStatus.java` — UNRESOLVED, PENDING_CLAIM, RESOLVED statuses

- **Entities:**
  - `User.java` — User profile with JPA annotations, encapsulation, validation
  - `ItemPost.java` — Item post entity with relationships to User

- **Repositories:**
  - `UserRepository.java` — findByEmail, existsByEmail methods
  - `ItemPostRepository.java` — Search, filter, pagination methods

#### Phase 2: Authentication Foundation
- **Exception Handling:**
  - `UserAlreadyExistsException.java` — Custom exception for duplicate email
  - `InvalidCredentialsException.java` — Custom exception for bad credentials
  - `ResourceNotFoundException.java` — Custom exception for missing resources
  - `UnauthorizedActionException.java` — Custom exception for forbidden actions
  - `GlobalExceptionHandler.java` — Centralized error response formatting

- **Security & JWT:**
  - `JwtTokenProvider.java` — Token generation, validation, claim extraction
  - `JwtAuthenticationFilter.java` — JWT authentication filter
  - `SecurityConfig.java` — Spring Security configuration with JWT

- **DTOs:**
  - `LoginRequest.java` — Login credentials DTO
  - `RegisterRequest.java` — Registration details DTO
  - `UserResponse.java` — User information DTO
  - `AuthResponse.java` — Authentication response with JWT token

- **Services:**
  - `AuthService.java` — User registration, login, token generation

- **Controllers:**
  - `AuthController.java` — POST /api/auth/register, POST /api/auth/login endpoints

- **Tests:**
  - `AuthServiceTest.java` — 6 unit tests covering registration and login scenarios
  - `JwtTokenProviderTest.java` — 7 unit tests for token operations

### Configuration Updates
- **application.properties:**
  - Added JWT secret key
  - Added JWT expiration (24 hours)
  - Added logging configuration
  - Added server port and context path

### Engineering Principles Applied
✅ Thin Controllers — Controllers only handle requests/responses  
✅ Business Logic in Services — All logic in AuthService  
✅ Encapsulation — Private fields with getters/setters  
✅ SRP — One responsibility per class  
✅ DTO Pattern — No entity exposure to API  
✅ Consistent Error Handling — Global exception handler  
✅ Strong Naming — Clear, purposeful class names  
✅ No Magic Logic — Explicit validation and error messages  
✅ Modular Structure — Clean folder organization  

### Testing Coverage
- AuthService: Registration success, duplicate email, login success, invalid credentials
- JwtTokenProvider: Token generation, extraction, validation, expiration, different tokens

### Ready for
- ✅ Building with Maven
- ✅ PostgreSQL integration tests
- ✅ Manual API testing with Postman
- ✅ Frontend integration
