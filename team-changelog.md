# Bulldog Founds — Team Changelog

All changes are listed in chronological order from oldest to newest.

---

## [2026-05-29] Phase 1 & 2 — Foundation, Entities, Auth & JWT — Acosta

### Summary
Set up the entire backend foundation: project structure, core entities, enums, repositories, JWT security, authentication service, and all related DTOs and exception handling.

---

### Added

#### Project Structure
- Initialized Spring Boot project with proper layered architecture
- Package structure: `controller/`, `service/`, `repository/`, `entity/`, `dto/`, `enums/`, `exception/`, `security/`, `config/`

#### Enums
- `UserRole.java` — `STUDENT`, `FACULTY`, `STAFF`
- `ItemStatus.java` — `UNRESOLVED`, `PENDING_CLAIM`, `RESOLVED`

#### Entities
- `User.java` — User profile with encapsulated fields, JPA annotations, BCrypt-compatible password field, `getFullName()` helper, `@OneToMany` relationship to `ItemPost`
- `ItemPost.java` — Item post with all required fields, `@ManyToOne` to `User`, `@PreUpdate` for `updatedAt` auto-update, default status of `UNRESOLVED`

#### Repositories
- `UserRepository.java` — `findByEmail(String)`, `existsByEmail(String)`
- `ItemPostRepository.java` — `findByTitleContainingIgnoreCase`, `findByColorContainingIgnoreCase`, `findByStatus`, `findByCreatedByIdOrderByCreatedAtDesc`, combined search by title + color

#### Exception Classes
- `UserAlreadyExistsException.java`
- `InvalidCredentialsException.java`
- `ResourceNotFoundException.java`
- `UnauthorizedActionException.java`
- `GlobalExceptionHandler.java` — Centralized handler returning standard `{ timestamp, status, message, error }` format for all exceptions including validation errors

#### Security & JWT
- `JwtTokenProvider.java` — Token generation, validation, claim extraction using HS256; configurable secret and expiration via `application.properties`
- `JwtAuthenticationFilter.java` — Per-request JWT validation filter
- `SecurityConfig.java` — Stateless JWT security; `/api/auth/**` public; `/api/items/**` requires authentication; BCrypt password encoder bean

#### DTOs
- `LoginRequest.java`
- `RegisterRequest.java` — with `@NotBlank`, `@Email`, `@Size` validation
- `UserResponse.java`
- `AuthResponse.java` — includes `token`, `tokenType: "Bearer"`, `expiresIn`, and full `UserResponse`

#### Services
- `AuthService.java`:
  - `register()` — checks email uniqueness, encodes password with BCrypt, saves user, generates JWT
  - `login()` — validates credentials, generates JWT

#### Controllers
- `AuthController.java`:
  - `POST /api/auth/register` → 201 Created with `AuthResponse`
  - `POST /api/auth/login` → 200 OK with `AuthResponse`

#### Configuration
- `application.properties`:
  - PostgreSQL datasource configured (`localhost:5432/bulldogfounds`)
  - `spring.jpa.hibernate.ddl-auto=update`
  - JWT secret and 24-hour expiration (`86400000ms`)
  - File upload config (`./uploads`, max 5MB)
  - Server on port 8080

#### Tests
- `AuthServiceTest.java` — 6 unit tests: register success, duplicate email, login success, invalid password, user not found
- `JwtTokenProviderTest.java` — 7 unit tests: token generation, subject extraction, expiration, validation, invalid token rejection

---

### Engineering Principles Applied
- Thin controllers — no business logic in `AuthController`
- Business logic isolated in `AuthService`
- DTO pattern — entities never exposed directly to API
- SRP — one responsibility per class
- Consistent error format via `GlobalExceptionHandler`
- BCrypt for password security
- Stateless JWT — no server-side sessions

---

### Known Issues / TODOs
- ⚠️ `RegisterRequest` does not enforce NU Laguna email domain (`@nu-laguna.edu.ph`) — required by Project Requirements §4.8
- ⚠️ JWT secret in `application.properties` is a placeholder — must be changed before production

---

## [2026-05-29] Phase 3 — Item Management (CRUD, Search, Filter) — Acosta

### Summary
Implemented full item post lifecycle: creation, retrieval, search, filtering, status updates, ownership-based editing and deletion.

---

### Added

#### DTOs
- `CreateItemRequest.java` — validated fields: `title`, `color`, `description`, `lastKnownLocation`, `claimLocation`, optional `additionalDetails`
- `ItemResponse.java` — full item metadata including `createdById`, `createdByName`, `createdByEmail`, `createdByTeamsLink`
- `UpdateItemRequest.java` — all fields optional (partial update support)
- `UpdateItemStatusRequest.java` — single `status` field

#### Services
- `ItemService.java`:
  - `createItem(userId, request)` — looks up user, builds and saves `ItemPost`
  - `getAllItems(pageable)` — paginated, read-only
  - `getItemById(id)` — throws `ResourceNotFoundException` if missing
  - `searchItems(keyword, pageable)` — title keyword search
  - `filterByColor(color, pageable)` — color filter
  - `filterByStatus(status, pageable)` — status filter
  - `searchAndFilter(keyword, color, pageable)` — combined title + color filter
  - `getUserItems(userId, pageable)` — items by owner, sorted by `createdAt DESC`
  - `updateItem(id, userId, request)` — ownership check, partial field update
  - `updateItemStatus(id, userId, request)` — ownership check, status change
  - `deleteItem(id, userId)` — ownership check, hard delete

#### Controllers
- `ItemController.java`:
  - `POST /api/items` (JSON) — create item
  - `GET /api/items` — list all (paginated, sortable)
  - `GET /api/items/{id}` — get single item
  - `GET /api/items/search?keyword=` — keyword search
  - `GET /api/items/filter/color?color=` — color filter
  - `GET /api/items/filter/status?status=` — status filter
  - `GET /api/items/search/advanced?keyword=&color=` — combined search
  - `GET /api/items/my-items` — authenticated user's posts
  - `PUT /api/items/{id}` — update item
  - `PATCH /api/items/{id}/status` — update status
  - `DELETE /api/items/{id}` — delete item (also removes associated image)

#### Tests
- `ItemServiceTest.java` — 19 unit tests covering all service methods including authorization failure scenarios

---

### Engineering Principles Applied
- Thin controllers — pagination built in controller, all logic in service
- Ownership validation before any mutation (`updateItem`, `updateItemStatus`, `deleteItem`)
- Read-only `@Transactional` on all query methods
- DTO mapping via private `mapToResponse()` — no entity leakage

---

### Known Issues / TODOs
- ⚠️ `extractUserIdFromAuth()` in `ItemController` hardcodes `return 1L` — **this is a critical bug**. User ID is not actually extracted from the JWT; all item operations will use user ID `1` regardless of who is authenticated. Must be fixed before frontend integration.
- ⚠️ `searchAndFilter` only combines title + color, not status — changelog previously claimed status was included in combined search but it is not

---

## [2026-05-29] Phase 4 — Image Upload (File Storage) — Acosta

### Summary
Added local file storage for item images. Items can now be created with an optional image via multipart form upload.

---

### Added

#### Services
- `FileService.java`:
  - `saveFile(MultipartFile)` — validates file, generates UUID filename, saves to `./uploads/`
  - `deleteFile(String filePath)` — silently deletes file if it exists
  - Validation: max 5MB, allowed types JPEG, PNG, GIF, WebP

#### Controllers (Modified)
- `ItemController.java` — added `POST /api/items` multipart endpoint:
  - Accepts form fields + optional `imageFile`
  - Calls `FileService.saveFile()` if file present
  - Sets `imageUrl` on returned `ItemResponse`
  - `DELETE /api/items/{id}` now also calls `FileService.deleteFile()` to clean up image

#### Configuration (Modified)
- `application.properties` — `file.upload-dir=./uploads`, `spring.servlet.multipart.max-file-size=5MB`, `spring.servlet.multipart.max-request-size=5MB`

#### Tests
- `FileServiceTest.java` — 9 unit tests: save JPEG/PNG/GIF/WebP, reject oversized file, reject invalid type, delete existing file, delete non-existent file, handle null/empty input

---

### Engineering Principles Applied
- SRP — `FileService` handles only file I/O; `ItemService` handles only item logic
- Validation centralized in `FileService.validateFile()`
- Backward compatibility — JSON-only `POST /api/items` endpoint still works

---

### Known Issues / TODOs
- ⚠️ `FileService` throws `InvalidCredentialsException` for file validation errors — this is semantically wrong. Should throw a dedicated `InvalidFileException` or `BadRequestException`
- ⚠️ Image URL is set on the `ItemResponse` after creation but **not persisted** to the database. The `createItem()` call in `ItemController` saves the item first, then sets `imageUrl` on the DTO only — the database row will have a null `imageUrl`. This is a bug.
- ⚠️ No static resource serving configured — uploaded images cannot be accessed via HTTP URL yet

---

## Overall MVP Completion Status

| Feature | Implemented | Tests | Notes |
|---|---|---|---|
| Core Entities (User, ItemPost) | ✅ | — | Enums, relationships, validation |
| User Registration | ✅ | ✅ (AuthService) | Missing NU email domain validation |
| User Login + JWT | ✅ | ✅ (AuthService + JWT) | 24hr token, HS256 |
| Spring Security Config | ✅ | — | Stateless, public/private routes |
| Item CRUD | ✅ | ✅ (ItemService) | Full ownership checks |
| Search & Filter | ✅ | ✅ | Keyword, color, status, combined |
| Image Upload | ✅ | ✅ (FileService) | Local storage only |
| Exception Handling | ✅ | — | Global handler, standard format |
| Input Validation | ✅ | — | @Valid on all DTOs |
| PostgreSQL Config | ✅ | — | Configured, needs real password |
| Frontend (React + TS) | ✅ | — | Not yet started |
| Role-based Authorization | 🔲 | — | Enum defined, logic not enforced |
| Pagination | ✅ | — | All list endpoints paginated |
| User Profile Endpoint | 🔲 | — | Not yet implemented |

---

## Critical Bugs to Fix Before Frontend Integration

1. **`ItemController.extractUserIdFromAuth()` returns hardcoded `1L`** — all mutations will be attributed to user ID 1 regardless of logged-in user. Fix by loading user from DB by email extracted from JWT.
2. **Image URL not persisted to DB** — `imageUrl` is set on the response DTO but not saved to the `ItemPost` entity after file upload.
3. **`FileService` uses `InvalidCredentialsException` for file errors** — misleading and incorrect; replace with a proper exception type.
4. **Missing NU Laguna email domain validation** — `RegisterRequest` accepts any email; should enforce `@nu-laguna.edu.ph` domain per requirements.
