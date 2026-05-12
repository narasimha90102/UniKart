# UniKart API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication (`/api/auth`)

### 1. Register User
- **Method:** POST
- **Endpoint:** `/register`
- **Body:** `{ "name": "...", "email": "...@*.edu", "password": "...", "college": "..." }`
- **Response:** 201 Created (Returns JWT)

### 2. Login User
- **Method:** POST
- **Endpoint:** `/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** 200 OK (Returns JWT)

### 3. Get Profile
- **Method:** GET
- **Endpoint:** `/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** 200 OK

## Products (`/api/products`)

### 1. Get All Products
- **Method:** GET
- **Endpoint:** `/`
- **Query Params:** `?category=Electronics&sort=-price&search=laptop`
- **Response:** 200 OK

### 2. Create Product
- **Method:** POST
- **Endpoint:** `/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "title": "...", "description": "...", "price": 100, "category": "Electronics", "condition": "New", "location": "...", "images": ["url"] }`
- **Response:** 201 Created

## Users (`/api/users`)

### 1. Rate User
- **Method:** POST
- **Endpoint:** `/:id/rate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "rating": 4 }`
- **Response:** 200 OK

## Notifications (`/api/notifications`)

### 1. Get User Notifications
- **Method:** GET
- **Endpoint:** `/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** 200 OK

### 2. Mark as Read
- **Method:** PUT
- **Endpoint:** `/:id/read`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** 200 OK

## Admin (`/api/admin`)

*All admin routes require a valid JWT belonging to a user with `role: 'admin'`.*

### 1. Get All Users
- **Method:** GET
- **Endpoint:** `/users`

### 2. Update User Status (Suspend/Ban)
- **Method:** PUT
- **Endpoint:** `/users/:id/status`
- **Body:** `{ "status": "suspended" }`
