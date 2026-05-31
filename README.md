# 🐾 Bulldog Founds

> A full-stack campus Lost & Found web application for **National University Laguna**.

Bulldog Founds helps NU Laguna students, faculty, and staff report lost items, browse found items, and connect with each other through Microsoft Teams — all within a secure, authenticated platform.

---

## 👥 Team Members

| Name |
|---|
| Acosta | 
| Badosa | 
| Costiniano | 


---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Axios |
| Backend | Java, Spring Boot, Spring Security, JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Auth | JWT (HS256) + BCrypt password hashing |
| Testing | JUnit 5, Mockito |
| Build Tools | Maven (backend), npm (frontend) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│   React + TypeScript + Vite (port 5173)         │
│   ├── pages/        (6 pages)                   │
│   ├── components/   (Header, Footer, Spinner)   │
│   ├── context/      (AuthContext — global state)│
│   ├── services/     (Axios API clients)         │
│   ├── hooks/        (useAuth custom hook)       │
│   └── types/        (TypeScript interfaces)     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST (Axios + JWT Bearer)
┌──────────────────▼──────────────────────────────┐
│                   Backend                       │
│   Spring Boot (port 8080)                       │
│   ├── controller/   (thin REST controllers)     │
│   ├── service/      (business logic)            │
│   ├── repository/   (JPA data access layer)     │
│   ├── entity/       (JPA-mapped domain models)  │
│   ├── dto/          (request/response objects)  │
│   ├── exception/    (custom exceptions)         │
│   ├── security/     (JWT filter + config)       │
│   └── enums/        (UserRole, ItemStatus)      │
└──────────────────┬──────────────────────────────┘
                   │ JDBC (Spring Data JPA)
┌──────────────────▼──────────────────────────────┐
│                 PostgreSQL                      │
│   Database: bulldogfounds                       │
│   Tables: users, item_posts                     │
└─────────────────────────────────────────────────┘
```

---

## 🧩 OOP Concepts Applied

### Encapsulation
All entity fields (`User`, `ItemPost`) are **private**, accessed only through getters/setters provided by Lombok `@Data`. The internal state of a user's password or ID cannot be directly mutated from outside the class.

### Abstraction
Controllers interact with **service-level abstractions**. `AuthController` calls `authService.register()` without knowing how password hashing, JWT generation, or database persistence is done internally.

### Inheritance
`JwtAuthenticationFilter` **extends** Spring's `OncePerRequestFilter`, inheriting guaranteed single-execution-per-request behavior and overriding `doFilterInternal()` to plug in JWT validation logic.

### Polymorphism
`GlobalExceptionHandler` uses **method overloading** via multiple `@ExceptionHandler` methods — each handles a different exception type. Spring dispatches the correct handler at runtime based on the thrown exception's type.

---

## 🏛️ Design Patterns & Principles

| Pattern / Principle | Where Applied |
|---|---|
| **DTO Pattern** | 8 DTOs isolate API contract from database schema (`CreateItemRequest`, `ItemResponse`, etc.) |
| **Repository Pattern** | `UserRepository`, `ItemPostRepository` — all DB access through JPA interfaces |
| **Builder Pattern** | Lombok `@Builder` on all entities and DTOs — fluent, readable object construction |
| **Singleton Pattern** | All Spring `@Service`, `@Repository`, `@Controller` beans — one instance per application |
| **SRP (SOLID)** | Every class has exactly one responsibility — `FileService` only handles files, `JwtTokenProvider` only handles tokens |
| **DRY** | `mapToResponse()` helper in `ItemService` eliminates repeated entity-to-DTO mapping |
| **Layered Architecture** | Strict 4-layer separation: Controller → Service → Repository → Entity |
| **GRASP — Information Expert** | `ItemService` owns all item-related logic (create, update, filter, delete) |
| **GRASP — Creator** | `AuthService` is responsible for creating `User` entities |
| **GRASP — Controller** | `@RestController` classes receive system events and delegate to services |
| **GRASP — Low Coupling** | Constructor injection via `@RequiredArgsConstructor` — no service-to-service direct coupling |
| **GRASP — High Cohesion** | Each service is tightly focused on its domain domain |

---

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 16+
- Maven 3.9+

### 1. Database Setup

Open `psql` or pgAdmin and run:

```sql
CREATE DATABASE bulldogfounds;
```

### 2. Backend Setup

```bash
cd backend/bulldogfounds
```

Create an `application-local.properties` file (or update `application.properties`) with your credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bulldogfounds
spring.datasource.username=your_pg_username
spring.datasource.password=your_pg_password
jwt.secret=your-long-random-secret-key-at-least-32-chars
```

Run the backend:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Backend will start at: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173`

### 4. Access the App

Open your browser and go to: **http://localhost:5173**

Register with an NU Laguna email:
- Students: `yourname@students.nu-laguna.edu.ph`
- Faculty/Staff: `yourname@nu-laguna.edu.ph`

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/users/profile` | Get current user profile | Yes |

### Item Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/items` | Get all items (paginated) | Yes |
| `GET` | `/api/items/{id}` | Get item by ID | Yes |
| `GET` | `/api/items/search?keyword=` | Search by title keyword | Yes |
| `GET` | `/api/items/filter/color?color=` | Filter by color | Yes |
| `GET` | `/api/items/filter/status?status=` | Filter by status | Yes |
| `GET` | `/api/items/user/{userId}` | Get items by user | Yes |
| `POST` | `/api/items` | Create a new item post | Yes |
| `PUT` | `/api/items/{id}` | Update item details | Yes (owner only) |
| `PATCH` | `/api/items/{id}/status` | Update item status | Yes (owner only) |
| `DELETE` | `/api/items/{id}` | Delete an item post | Yes (owner only) |

### File Upload

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/items/upload-image` | Upload item image (max 5MB) |

---

## 🧪 Running Tests

```bash
cd backend/bulldogfounds

# Run all tests
.\mvnw.cmd test

# Run with coverage report
.\mvnw.cmd test jacoco:report
```

### Test Coverage

| Test File | Tests | Coverage |
|---|---|---|
| `AuthServiceTest.java` | 5 tests | Register, login, duplicate email, invalid password, user not found |
| `ItemServiceTest.java` | ~15 tests | Full CRUD, ownership checks, search, filter, pagination |
| `FileServiceTest.java` | ~10 tests | Upload, delete, file type validation |
| `UserServiceTest.java` | ~8 tests | Profile retrieval, user not found |
| `JwtTokenProviderTest.java` | 7 tests | Token generation, validation, expiry |

---

## 📁 Project Structure

```
bulldog-founds/
├── backend/
│   └── bulldogfounds/
│       └── src/
│           ├── main/java/com/bulldogfounds/
│           │   ├── config/          # SecurityConfig, WebMvcConfig
│           │   ├── controller/      # AuthController, ItemController, UserController
│           │   ├── dto/             # Request and Response DTOs
│           │   ├── entity/          # User, ItemPost
│           │   ├── enums/           # UserRole, ItemStatus
│           │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│           │   ├── repository/      # UserRepository, ItemPostRepository
│           │   ├── security/        # JwtTokenProvider, JwtAuthenticationFilter
│           │   └── service/         # AuthService, ItemService, FileService, UserService
│           └── test/                # JUnit 5 + Mockito unit tests
├── frontend/
│   └── src/
│       ├── api/         # Axios instance with JWT interceptor
│       ├── components/  # Reusable UI components
│       ├── context/     # AuthContext (global auth state)
│       ├── hooks/       # useAuth custom hook
│       ├── pages/       # LoginPage, RegisterPage, ItemListPage, etc.
│       ├── routes/      # Protected route wrapper
│       ├── services/    # authService, itemService (API calls)
│       ├── types/       # TypeScript interfaces
│       └── utils/       # Utility functions
├── team-changelog.md    # Full development history
├── change.log           # Summary change log
└── README.md            # This file
```

---

## 🔒 Security Notes

- Passwords are hashed using **BCrypt** — never stored in plaintext.
- All protected routes require a **JWT Bearer token** in the `Authorization` header.
- Only **NU Laguna email domains** are accepted for registration.
- Users can only **edit or delete their own posts** — enforced at the service layer.
- CORS is configured to accept requests only from `http://localhost:5173`.

> ⚠️ **Before deploying to production:** Replace the JWT secret and database credentials with secure values stored in environment variables.

---

## 📝 Changelog

See [team-changelog.md](./team-changelog.md) for full development history.

---

## 📄 License

This project was created for academic purposes at **National University Laguna**.
