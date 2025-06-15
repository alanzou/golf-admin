# System User Authentication API

This document describes the authentication API endpoints for system users.

## Environment Variables

Add these to your `.env.local` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=your-postgresql-connection-string
```

## API Endpoints

### 1. Create System User

**POST** `/api/auth/create-user`

Creates a new system user with hashed password.

**Request Body:**
```json
{
  "name": "admin",
  "password": "securepassword123",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "password": "securepassword123",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### 2. Login

**POST** `/api/auth/login`

Authenticates a system user and returns a JWT token.

**Request Body:**
```json
{
  "name": "admin",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "password": "securepassword123"
  }'
```

### 3. Get Profile (Protected)

**GET** `/api/auth/profile`

Returns the current user's profile information. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Usage Flow

1. **Create a user** (first time setup):
   ```bash
   curl -X POST http://localhost:3000/api/auth/create-user \
     -H "Content-Type: application/json" \
     -d '{"name": "admin", "password": "securepassword123"}'
   ```

2. **Login to get token**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name": "admin", "password": "securepassword123"}'
   ```

3. **Use token for protected routes**:
   ```bash
   curl -X GET http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid credentials or token)
- `404` - Not Found (user not found)
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

Example error response:
```json
{
  "error": "Invalid credentials"
}
```

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 24 hours
- User accounts can be disabled via the `isActive` flag
- Protected routes require valid JWT tokens
- Sensitive information (passwords) are never returned in responses 