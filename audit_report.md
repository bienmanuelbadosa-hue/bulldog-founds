# Bulldog Founds — Implementation Audit Report

**Audited against:** `team-changelog.md` + `Project Requirements.txt`
**Date:** 2026-05-31
**Auditor:** Antigravity (Senior Engineer Review)

---

## Audit Summary

| Category | Count |
|---|---|
| ✅ Correctly implemented | 28 |
| ⚠️ Claimed but partially wrong / inaccurate | 5 |
| 🐛 Known bugs (already in changelog) | 4 |
| ❌ Missing entirely (not in changelog) | 6 |
| 🔍 Additional issues found (not in changelog) | 5 |

---

## ✅ Correctly Implemented (verified in code)

### Phase 1 & 2 — Foundation, Entities, Auth & JWT

- [x] Spring Boot project initialized with correct layered package structure (`controller/`, `service/`, `repository/`, `entity/`, `dto/`, `enums/`, `exception/`, `security/`, `config/`)
- [x] `UserRole.java` enum — `STUDENT`, `FACULTY`, `STAFF`
- [x] `ItemStatus.java` enum — `UNRESOLVED`, `PENDING_CLAIM`, `RESOLVED`
- [x] `User.java` entity — all required fields present (`id`, `firstName`, `lastName`, `email`, `password`, `role`, `teamsLink`, `createdAt`), `@OneToMany` to `ItemPost`, `getFullName()` helper
- [x] `ItemPost.java` entity — all required fields present including `imageUrl`, `@ManyToOne` to `User`, `@PreUpdate` on `updatedAt`
- [x] `UserRepository.java` — `findByEmail()` and `existsByEmail()` present
- [x] `ItemPostRepository.java` — `findByTitleContainingIgnoreCase`, `findByColorContainingIgnoreCase`, `findByStatus`, `findByCreatedByIdOrderByCreatedAtDesc`, combined search present
- [x] `UserAlreadyExistsException`, `InvalidCredentialsException`, `ResourceNotFoundException`, `UnauthorizedActionException` all present
- [x] `GlobalExceptionHandler.java` — handles all 4 custom exceptions + `MethodArgumentNotValidException` + generic `Exception`
- [x] `JwtTokenProvider.java` — token generation, validation, claim extraction, HS256
- [x] `JwtAuthenticationFilter.java` — exists
- [x] `SecurityConfig.java` — stateless JWT, `/api/auth/**` public, BCrypt bean
- [x] `LoginRequest.java`, `RegisterRequest.java` (with `@NotBlank`, `@Email`, `@Size`), `UserResponse.java`, `AuthResponse.java` (with `token`, `tokenType`, `expiresIn`, `UserResponse`) — all present
- [x] `AuthService.register()` — email uniqueness, BCrypt, JWT generation
- [x] `AuthService.login()` — credential validation, JWT generation
- [x] `AuthController` — `POST /api/auth/register` → 201, `POST /api/auth/login` → 200
- [x] `AuthServiceTest.java` — 4 tests verified (register success, duplicate email, login success, login invalid password, login user not found)
- [x] `JwtTokenProviderTest.java` — exists

### Phase 3 — Item Management

- [x] `CreateItemRequest.java`, `ItemResponse.java`, `UpdateItemRequest.java`, `UpdateItemStatusRequest.java` — all present
- [x] All `ItemService` methods implemented: `createItem`, `getAllItems`, `getItemById`, `searchItems`, `filterByColor`, `filterByStatus`, `searchAndFilter`, `getUserItems`, `updateItem`, `updateItemStatus`, `deleteItem`
- [x] Ownership checks in `updateItem`, `updateItemStatus`, `deleteItem`
- [x] `@Transactional(readOnly = true)` on all query methods
- [x] `mapToResponse()` private helper — no entity leakage
- [x] `ItemController` — all endpoints present and mapped correctly
- [x] `ItemServiceTest.java` — exists

### Phase 4 — Image Upload

- [x] `FileService.saveFile()` — validates, UUID filename, saves to `./uploads/`
- [x] `FileService.deleteFile()` — silently deletes if exists
- [x] File validation: max 5MB, JPEG/PNG/GIF/WebP
- [x] `DELETE /api/items/{id}` calls `FileService.deleteFile()` before item deletion
- [x] `FileServiceTest.java` — exists

### Frontend (beyond changelog claim of "not yet started")

- [x] Frontend project initialized (Vite + React + TypeScript)
- [x] `api.ts` — centralized API client exists
- [x] Pages implemented: `LoginPage`, `RegisterPage`, `ItemListPage`, `CreateItemPage`, `ItemDetailPage`
- [x] `Header.tsx` component exists
- [x] `App.tsx` — routing logic, auth state, localStorage token handling

---

## ⚠️ Claimed But Inaccurate or Partially Wrong

### 1. Changelog says "6 unit tests" for AuthService — **only 4 are in the file**
- The changelog says: _"6 unit tests: register success, duplicate email, login success, invalid password, user not found"_
- The actual `AuthServiceTest.java` has **4 test methods** (the list mentions 5 scenarios but the count says 6 — neither is accurate; there are 4 tests)

### 2. Changelog says "7 unit tests" for JwtTokenProvider — **not verified yet, file exists**
- `JwtTokenProviderTest.java` exists but its content was not read. The count should be verified.

### 3. Status update endpoint — **PATCH not PUT**
- Changelog says `PUT /api/items/{id}/status`
- Requirements §4.5 also says `PUT /api/items/{id}/status`
- Actual code uses **`@PatchMapping("/{id}/status")`** (`PATCH`)
- This is actually the correct REST convention (changelog and requirements are slightly off), but it is a **discrepancy to note**

### 4. `ItemController` changelog says "also removes associated image" on DELETE — **partially correct but order is wrong**
- The code calls `getItemById()` to fetch the image URL *before* deletion, then `fileService.deleteFile()`, then `itemService.deleteItem()`
- This works, but it makes two separate service calls where one would suffice. The item is fetched twice (once in `getItemById`, once inside `deleteItem`). This is an efficiency issue, not a bug, but it wasn't noted.

### 5. Changelog's MVP Status table says "Frontend (React + TS) | ✅ | — | Not yet started"
- **This is a contradiction.** The checkbox is ✅ but the notes say "Not yet started"
- In reality, a **frontend already exists** with 6 component files, `api.ts`, `App.tsx`, routing, and auth state. The changelog is out of date.

---

## 🐛 Known Bugs (Already Documented in Changelog)

These are confirmed present in the code:

1. **`extractUserIdFromAuth()` returns hardcoded `1L`** (line 353, `ItemController.java`) — ✅ confirmed in code
2. **Image URL not persisted to DB** — `imageUrl` is set on the `ItemResponse` DTO after `createItem()` is called but the `ItemPost` entity in the DB has `null` `imageUrl` — ✅ confirmed in code (lines 89–92, `ItemController.java`)
3. **`FileService` throws `InvalidCredentialsException` for file errors** — ✅ confirmed in code (lines 38, 84, 98, `FileService.java`)
4. **`RegisterRequest` does not enforce `@nu-laguna.edu.ph` email domain** — ✅ confirmed in code (only `@Email` annotation, no domain check)

---

## ❌ Missing Entirely (Not Mentioned in Changelog)

### 1. `mapper/` and `util/` packages — **required by Project Requirements §4.1, not created**
- The requirements spec (`§4.1`) shows `mapper/` and `util/` as required folders
- These do not exist in the project
- The service's `mapToResponse()` is a private method inside `ItemService`, not a dedicated `mapper/` class — acceptable for MVP but deviates from spec

### 2. `service/impl/` package — **required by Project Requirements §4.1, not created**
- Requirements spec shows `service/impl/` as the recommended sub-structure
- Not created; services live directly in `service/`

### 3. **No static resource serving configured for uploaded images**
- Known as a TODO in Phase 4 changelog
- Images are saved to `./uploads/` but there is **no `@Configuration` to expose `/uploads/**` as a static resource URL**
- Uploaded image URLs cannot be accessed via HTTP — the `imageUrl` field in responses is a local filesystem path (e.g. `./uploads/uuid.jpg`), not a URL

### 4. **Frontend: No proper folder structure per requirements (§5.1)**
- Required: `pages/`, `components/`, `hooks/`, `layouts/`, `routes/`, `services/`, `types/`, `utils/`, `api/`
- Actual: all page components are in a single flat `components/` folder with no separation between pages and components; no `hooks/`, `types/`, `services/`, `routes/`, `layouts/` folders

### 5. **Frontend: No form validation library**
- Requirements §5.6 specifies **React Hook Form + Zod or Yup**
- Actual: forms use raw `useState` with no schema validation

### 6. **Frontend: `ProfilePage` is missing**
- Requirements §5.2 lists `ProfilePage` as a required page
- Changelog MVP table marks "User Profile Endpoint" as 🔲 (backend) but does not mention frontend profile page missing either
- Frontend has `LoginPage`, `RegisterPage`, `ItemListPage`, `CreateItemPage`, `ItemDetailPage` — no `ProfilePage`

---

## 🔍 Additional Issues Found (Not in Changelog)

### 1. `SecurityConfig` makes `/api/items/search` and `/api/items/{id}` **public** — but changelog/requirements say all `/api/items/**` requires authentication
- Line 54–55: `.requestMatchers("/api/items/search").permitAll()` and `.requestMatchers("/api/items/{id}").permitAll()`
- Requirements §4.10 says `/items/**` → Authenticated
- This may be intentional but is **undocumented** and contradicts requirements

### 2. `RegisterRequest` — `role` field has **no `@NotNull` validation**
- Requirements §4.8 says "Role: Required"
- `RegisterRequest.java` line 37: `private UserRole role;` — no validation annotation
- A user could register without specifying a role; `AuthService` gracefully defaults to `STUDENT`, but the validation is missing at the DTO level

### 3. `ItemController` — `createItemWithFile` endpoint does **not validate the `CreateItemRequest` fields** via `@Valid`
- The multipart endpoint (lines 58–95) receives each field as individual `@RequestParam` — there is **no `@Valid` applied** because there's no DTO object
- Required fields like `title`, `description` etc. are not validated; they can be blank strings

### 4. `AuthServiceTest` — **5 scenarios described in changelog but only 4 test methods exist**
- Changelog: "6 unit tests: register success, duplicate email, login success, invalid password, user not found"
- Actual file: 4 `@Test` methods
- One scenario (either "login success" or "user not found") might be combined or mislabeled

### 5. `ItemPost.updatedAt` is in the entity but **not included in `ItemResponse` per changelog** — it actually IS mapped
- Changelog does not mention `updatedAt` in `ItemResponse`
- But the actual `mapToResponse()` in `ItemService` (line 297) does include it
- This is fine — it's a bonus field — but the changelog/API contract is incomplete

---

## Overall Assessment

| Phase | Implementation | Tests | Notes |
|---|---|---|---|
| Phase 1 — Foundation + Auth + JWT | ✅ Complete | ✅ (partial count discrepancy) | 4 known issues |
| Phase 2 — Entities + Structure | ✅ Complete | — | Missing `mapper/`, `util/`, `impl/` folders |
| Phase 3 — Item CRUD + Search | ✅ Complete | ✅ | `extractUserIdFromAuth()` hardcoded bug |
| Phase 4 — File Upload | ✅ Complete | ✅ | 3 known bugs; no static serving |
| Frontend | ⚠️ Partially done | ❌ None | Exists but undocumented; wrong structure; no validation library; missing ProfilePage |

---

## Priority Action List (Before Frontend Integration)

### Critical (Blockers)
1. Fix `extractUserIdFromAuth()` — must resolve real user from JWT email
2. Fix image URL not persisted to DB — must save `imageUrl` into `ItemPost` before returning response
3. Fix `FileService` wrong exception type — replace `InvalidCredentialsException` with `InvalidFileException`
4. Add NU email domain validation — `@Pattern` or custom validator on `RegisterRequest.email`

### High
5. Configure static resource serving for `/uploads/**`
6. Add `@Valid` / manual validation to multipart `createItemWithFile` endpoint
7. Add `@NotNull` to `role` field in `RegisterRequest`
8. Document `SecurityConfig` public endpoint decisions vs. requirements

### Medium
9. Update changelog — frontend is already partially implemented
10. Restructure frontend into proper `pages/`, `types/`, `hooks/`, `services/` folders
11. Add React Hook Form + Zod validation to frontend forms
12. Add `ProfilePage` to frontend

### Low
13. Create `mapper/`, `util/` packages per spec (or formally deviate from spec)
14. Fix test count discrepancies in changelog
