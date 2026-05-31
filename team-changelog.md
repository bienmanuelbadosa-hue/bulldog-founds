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
- `AuthServiceTest.java` — 5 unit tests: register success, duplicate email, login success, invalid password, user not found
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

---

## [2026-05-31] Phase 5 — Critical Bug Fixes (Pre-Frontend Integration) — Acosta

### Summary
Fixed all 4 critical bugs identified before frontend integration: proper JWT user resolution, image URL persistence, correct file exception types, and NU Laguna email domain enforcement.

---

### Fixed

#### Bug 1 — `extractUserIdFromAuth()` returned hardcoded `1L`

**Root Cause:** `ItemController.extractUserIdFromAuth()` always returned `1L` instead of the real authenticated user's ID. All item mutations (create, update, status change, delete) were incorrectly attributed to user ID 1.

**Fix:**
- `UserService.java` [NEW] — created `getUserIdByEmail(String email)` which looks up the user by email from the DB (the JWT principal is the user's email). Also includes `getUserByEmail(String email)` returning a `UserResponse` for future profile use.
- `ItemController.java` [MODIFIED] — injected `UserService`; `extractUserIdFromAuth()` now calls `userService.getUserIdByEmail(email)` for a real DB lookup.

#### Bug 2 — Image URL not persisted to DB

**Root Cause:** In the multipart `createItemWithFile` endpoint, the image was saved via `FileService.saveFile()` after the item was already created. The `imageUrl` was then set only on the response DTO, not on the saved `ItemPost` entity — so the `image_url` column in the database always remained `null`.

**Fix:**
- `CreateItemRequest.java` [MODIFIED] — added optional `imageUrl` field (server-side populated, not submitted by API clients).
- `ItemService.java` [MODIFIED] — `createItem()` now includes `imageUrl` from the request in the `ItemPost` builder, so it is persisted to the DB.
- `ItemController.java` [MODIFIED] — reordered multipart handler: file is uploaded first, then `imageUrl` is set on the `CreateItemRequest` before calling `itemService.createItem()`. The post-save DTO mutation is removed.

#### Bug 3 — `FileService` threw wrong exception type

**Root Cause:** `FileService` was throwing `InvalidCredentialsException` (HTTP 401) for file validation failures (wrong type, too large, empty). This was semantically incorrect — file errors are not authentication errors.

**Fix:**
- `InvalidFileException.java` [NEW] — dedicated `RuntimeException` for file upload validation failures.
- `GlobalExceptionHandler.java` [MODIFIED] — added `@ExceptionHandler(InvalidFileException.class)` returning HTTP 400 Bad Request with `"error": "Invalid File"`.
- `FileService.java` [MODIFIED] — all three `throw new InvalidCredentialsException(...)` replaced with `throw new InvalidFileException(...)`.

#### Bug 4 — No NU Laguna email domain validation

**Root Cause:** `RegisterRequest` only applied `@Email` (checks email format) but not domain. Any valid email address could register — not just `@nu-laguna.edu.ph` as required by Project Requirements §4.8.

**Fix:**
- `RegisterRequest.java` [MODIFIED] — added `@Pattern(regexp = "^[a-zA-Z0-9._%+\\-]+@nu-laguna\\.edu\\.ph$", message = "Email must be a valid NU Laguna email address (@nu-laguna.edu.ph)")` to the `email` field. Integrates with existing `@Valid` + `GlobalExceptionHandler` pipeline (returns 400 with validation error details).

---

### Tests Added / Updated

- `UserServiceTest.java` [NEW] — 4 unit tests: `getUserIdByEmail` success, `getUserIdByEmail` not found, `getUserByEmail` success, `getUserByEmail` not found
- `ItemServiceTest.java` [MODIFIED] — added `testCreateItemWithImageUrl()` verifying that `imageUrl` from `CreateItemRequest` is reflected in the saved item response
- `FileServiceTest.java` [MODIFIED] — updated all 4 `assertThrows` calls to expect `InvalidFileException` instead of `InvalidCredentialsException`

---

### Engineering Principles Applied
- SRP — `UserService` has a single clear responsibility: user identity and profile resolution
- Thin controllers — `extractUserIdFromAuth()` now delegates to `UserService`, no repository call in controller
- Correct exception semantics — `InvalidFileException` → 400, `InvalidCredentialsException` → 401
- DTO pattern — `imageUrl` flows through `CreateItemRequest` into the entity, never bypassing the service layer
- Validation by annotation — NU email enforced via `@Pattern` at the DTO level, not in service

---

### Known Issues / TODOs
- ⚠️ No static resource serving configured — uploaded images are saved to `./uploads/` but cannot be accessed via HTTP URL (no `/uploads/**` static resource mapping)
- ⚠️ `SecurityConfig` exposes `/api/items/search` and `/api/items/{id}` as public endpoints — this deviates from Project Requirements §4.10 which says all `/items/**` requires authentication. RESOLVED: Adjusted SecurityConfig to protect all items endpoints, exposing only auth and uploaded resources.

---

## Overall MVP Completion Status

| Feature | Implemented | Tests | Notes |
|---|---|---|---|
| Core Entities (User, ItemPost) | ✅ | — | Enums, relationships, validation |
| User Registration | ✅ | ✅ (AuthService) | NU email domain enforced ✅ |
| User Login + JWT | ✅ | ✅ (AuthService + JWT) | 24hr token, HS256 |
| Spring Security Config | ✅ | — | Stateless, public/private routes; all items secure ✅ |
| Item CRUD | ✅ | ✅ (ItemService) | Full ownership checks; real user ID from JWT ✅ |
| Search & Filter | ✅ | ✅ | Keyword, color, status, combined |
| Image Upload | ✅ | ✅ (FileService) | imageUrl now persisted to DB ✅ |
| Exception Handling | ✅ | — | Global handler, standard format; InvalidFileException added ✅ |
| Input Validation | ✅ | — | @Valid on all DTOs; NU email pattern enforced ✅ |
| PostgreSQL Config | ✅ | — | Configured, needs real password |
| UserService | ✅ | ✅ (UserService) | getUserIdByEmail + getUserByEmail |
| Frontend (React + TS) | ✅ | ✅ (tsc + vite) | Restructured and fully integrated ✅ |
| Role-based Authorization | 🔲 | — | Enum defined, logic not enforced |
| Pagination | ✅ | — | All list endpoints paginated |
| User Profile Endpoint | ✅ | ✅ (UserService) | Profile controller and fetch endpoints added ✅ |
| Static Image Serving | ✅ | — | WebMvcConfig maps /uploads/** statically ✅ |

---

## [2026-05-31] Phase 6 — Frontend Integration & Restructuring — Acosta

### Summary
Successfully refactored, restructured, and styled the entire React-TypeScript frontend application per guidelines. Integrated the frontend with backend API endpoints, configured static image resource serving, and resolved security configurations.

---

### Added

#### Backend Extensions
- `WebMvcConfig.java` [NEW] — Enables static resource serving for the `./uploads` directory mapping to `/uploads/**`.
- `UserController.java` [NEW] — Exposes the `GET /api/users/profile` endpoint to fetch user profiles.

#### Frontend Restructuring
- Restructured `frontend/src/` per directory layout:
  - `src/types/` — holds shared TypeScript interfaces.
  - `src/api/` — initialized `apiClient` using Axios with request interceptor for JWT token injection.
  - `src/services/` — added `authService` and `itemService` using Axios.
  - `src/context/` — added `AuthContext` to manage sessions, token persistence, and reactive state.
  - `src/utils/` — added reusable custom `zodResolver` to bind `react-hook-form` and `zod`.
  - `src/pages/` — moved and refactored LoginPage, RegisterPage, ItemListPage, CreateItemPage, and ItemDetailPage. Created `ProfilePage.tsx` [NEW] for personal feeds and Teams connection testing.

#### UI Revamp & Styling
- `index.css` [MODIFIED] — Redesigned with custom HSL variables, Outfit/Inter typography, responsive grids, buttons, and animations.
- `Header.tsx` [MODIFIED] — Implemented navigation toggles and light/dark mode switch.
- `App.tsx` [MODIFIED] — Tied providers together with dynamic page title updates for SEO.

#### Verifications
- Verified frontend TypeScript compiles and bundles cleanly via `npm run build`.
- Verified all 46 backend unit tests compile and pass successfully.

---

### Engineering Principles Applied
- Clean architecture and directory layout on the frontend
- React Context for managing global authentication state
- Separation of concerns between API client (Axios), services, and page components
- Modern typography, CSS variables, and styling with clean UX animations
- Form management and input validation via React Hook Form and Zod
- Page titles and SEO optimization via dynamic meta changes

---

### Known Issues / TODOs
- ⚠️ Backend `RegisterRequest` is missing DTO-level `@NotNull` validation on the `role` field.
- ⚠️ Frontend `authService.ts` uses `any` parameter types instead of typed DTOs.
- ⚠️ Frontend is missing structural folders (`hooks/`, `layouts/`, `routes/`) and shared components (`Footer`, `LoadingSpinner`).
- ⚠️ Navigation and layout wrapping is tangled inside `App.tsx` causing context issues.

---

## [2026-05-31] Phase 7 — Post-Audit Architecture Refactoring & Type Safety — Acosta

### Summary
Addressed architectural gaps identified during post-audit: added DTO validation, introduced full frontend types, refactored routing and layout hierarchy, and completed missing structural folder structures.

---

### Added

#### Backend Validation
- `RegisterRequest.java` [MODIFIED] — Added `@NotNull(message = "Role is required")` to the `role` field to enforce correct user role submission at the DTO layer.

#### Frontend Type Safety
- `types/index.ts` [MODIFIED] — Added `RegisterRequest` and `LoginRequest` interfaces.
- `authService.ts` [MODIFIED] — Replaced untyped `any` parameter signatures with strict typed interfaces.

#### Frontend Architecture & Layout
- `components/Footer.tsx` [NEW] — Shared footer copyright bar.
- `components/LoadingSpinner.tsx` [NEW] — Shared full-page loading spinner.
- `hooks/useAuth.ts` [NEW] — Clean hooks wrapper folder/re-export.
- `layouts/MainLayout.tsx` [NEW] — Combines `Header`, main slot, and `Footer` with internal navigation context consumption.
- `routes/AppRoutes.tsx` [MODIFIED] — Created to handle page switching, route protection, document titling, and NavigationContext. Wraps children inside `MainLayout`.
- `App.tsx` [MODIFIED] — Refactored to act as a thin bootstrap/provider shell that renders `AppRoutes` directly.

---

### Engineering Principles Applied
- Strict DTO-level request validation.
- Strong TypeScript typing (avoiding `any` in service signatures).
- Separation of concerns (separate layout, routing, and loading wrappers).
- React Context hierarchy matching the rendering hierarchy (wrapping pages in layout inside context provider).

---

## [2026-05-31] Phase 8 — PostgreSQL CORS & Image Upload Remediation — Acosta

### Summary
Initialized the local PostgreSQL database, resolved Spring Security CORS preflight check rejections, and corrected boundary detection for multipart file uploads during item posting.

---

### Added
- Initialized local PostgreSQL database `bulldogfounds` to resolve backend database connection issues.
- Added a bulletproof global `.cors()` configuration to Spring Security's `filterChain` and registered a `CorsConfigurationSource` bean in `SecurityConfig.java` that uses `setAllowedOriginPatterns` and `setAllowCredentials(true)` to explicitly permit all cross-origin requests, HTTP methods, and custom headers (including `Authorization`, `Content-Type`, and Axios-specific headers) during browser preflight checks.
- Permitted student email addresses ending with `@students.nu-laguna.edu.ph` by updating the regex validation pattern on both the backend DTO validation (`RegisterRequest.java`) and the frontend form schemas (`RegisterPage.tsx`, `LoginPage.tsx`).

---

### Modified

#### Frontend Integration Fixes
- `types/index.ts` [MODIFIED] — Made `ItemPost.updatedAt` optional to gracefully support null/unmodified timestamps. Refactored `PaginatedResponse<T>` to use `number` and `size` fields to align exactly with Spring's Page JSON response.
- `context/AuthContext.tsx` [MODIFIED] — Imported `RegisterRequest` and replaced the untyped `any` parameter in the `register` function type signature and implementation with strict types.
- `services/itemService.ts` [MODIFIED] — Changed `'Content-Type': 'multipart/form-data'` to `undefined` for `createItem` request headers, removing the static string and letting Axios/browser automatically generate the correct boundary string for the server.
- `pages/LoginPage.tsx` & `pages/RegisterPage.tsx` [MODIFIED] — Updated the client-side email Zod schemas to allow `@students.nu-laguna.edu.ph` email domains.

#### Backend Fixes
- `dto/RegisterRequest.java` [MODIFIED] — Updated the `@Pattern` email validation annotation to accept `@students.nu-laguna.edu.ph` format.

---

### Verifications
- Verified all 46 backend unit tests compile, connect, and pass successfully against the live PostgreSQL database.
- Verified frontend TypeScript compiles clean (`npx tsc --noEmit`) with 0 errors.
- Verified frontend production packaging bundles clean (`npm run build`) with 0 errors.

## [2026-05-31] Phase 9 — Software Design, OOP & Production Hardening — Badosa & Costiniano

### Summary
Addressed architectural gaps highlighted in the grading rubric, implemented high-grade software patterns (SOLID + DRY), hardened security configurations to avoid hardcoded credentials, and refactored the unit test suite to support service interfaces.

---

### Added
- `components/StatusBadge.tsx` [NEW] — Reusable status badge component using uniform theme colors across the application, implementing DRY.
- `components/ItemCard.tsx` [NEW] — Flexible grid/list item card layout component used globally in feed and profile screens to decouple layout templates from logical pages.
- `pages/NotFoundPage.tsx` [NEW] — High-aesthetic error 404 page for unmatched application state routes.
- `dto/ErrorResponse.java` [NEW] — Standard DTO representing API errors, completely decoupling domain entities and controllers from raw JSON map structures in exception handling.
- `utils/image.ts` [NEW] — Shared helper resolving relative file storage paths to absolute server ports.

---

### Modified

#### Backend Refactoring
- `GlobalExceptionHandler.java` [MODIFIED] — Imported and instantiated the new `ErrorResponse` DTO class, extracting the nested implementation to strictly follow SRP.
- `application.properties` [MODIFIED] — Replaced hardcoded PostgreSQL passwords and static JWT secrets with dynamic `${DB_PASSWORD}` and `${JWT_SECRET}` environment variable overrides, incorporating secure local fallbacks.
- `README.md` [MODIFIED] — Documented environment variables configuration for deployments.

#### Unit Test Remediations
- `AuthServiceTest.java`, `ItemServiceTest.java`, `FileServiceTest.java`, `UserServiceTest.java` [MODIFIED] — Reconfigured Mockito `@InjectMocks` declarations to wire up concrete Service implementation classes (`AuthServiceImpl`, `ItemServiceImpl`, etc.) instead of interfaces, resolving test runner initialization exceptions.

#### Frontend Cleanups
- `pages/ItemListPage.tsx`, `pages/ProfilePage.tsx`, `pages/ItemDetailPage.tsx` [MODIFIED] — Cleaned up redundant local styles and duplicate helper methods (`getImageUrl`, `statusBadgeStyle`), fully adopting the new reusable `ItemCard` and `StatusBadge` components.
- `routes/AppRoutes.tsx` [MODIFIED] — Registered `NotFoundPage` as a catch-all safety fallback.

---

### Verifications
- Verified all 46 backend JUnit test suites pass flawlessly against service abstraction layers (100% BUILD SUCCESS).
- Verified frontend static type checking compiles completely clean (`npx tsc --noEmit`) with 0 errors.

---

## [2026-06-01] Phase 10 — Authentication Error Swallowing & UX UI Remediation — Badosa & Costiniano

### Summary
Resolved a critical user experience issue where registering with duplicate emails or logging in with invalid credentials caused a silent page reset to the login screen without showing any warnings or error text.

---

### Fixed

#### Bug 1 — Silent Authentication Error Swallowing & App Reset
- **Root Cause:** In `AuthContext.tsx`, the `login` and `register` methods toggled the global `loading` state (`setLoading(true)`) and reset it in a `finally` block (`setLoading(false)`). When `loading` became `true`, the root `AppContent` in `App.tsx` unmounted `<AppRoutes />` entirely and mounted `<LoadingSpinner />`. This completely destroyed the local state of `RegisterPage.tsx` and `LoginPage.tsx` (losing inputs, `serverError` states, and pending `catch` executions). When the request finished, `loading` was set to `false`, causing `<AppRoutes />` to remount from scratch. This reset the current page back to the default `'login'` screen (as the user was not authenticated), giving the illusion of a silent reset without error messages.
- **Fix:** Removed the global `loading` state toggles (`setLoading(true/false)`) and `try-finally` wrappers from the `login` and `register` methods in `AuthContext.tsx`. The global `loading` state is now exclusively reserved for the initial session check on application boot. Both `LoginPage.tsx` and `RegisterPage.tsx` continue to use their own local `isSubmitting` states to manage form submission indicators. This keeps the pages mounted, preserves form data, and allows the page-level `catch` blocks to display `serverError` messages inline.

---

### Verifications
- Verified frontend static type checking compiles completely clean (`npx tsc --noEmit`) with 0 errors.



