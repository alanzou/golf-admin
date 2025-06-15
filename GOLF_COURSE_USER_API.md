# Golf Course User Management API

This document describes the API endpoints for managing users within specific golf courses.

## Overview

The golf course user system allows each golf course to have its own set of users with different roles and permissions. This is separate from:
- **SystemUser**: System-wide administrators
- **Customer**: Golf course customers who make bookings

## Database Schema

### User Model
```prisma
model User {
  id           Int        @id @default(autoincrement())
  username     String
  password     String     // Hashed with bcrypt
  email        String     @default("")
  firstName    String     @default("")
  lastName     String     @default("")
  role         UserRole   @default(STAFF)
  isActive     Boolean    @default(true)
  golfCourseId Int
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @default(now())
  GolfCourse   GolfCourse @relation(fields: [golfCourseId], references: [id])

  @@unique([username, golfCourseId], map: "unique_username_per_course")
}
```

**Key Features:**
- Username is unique per golf course (not globally)
- Each user belongs to exactly one golf course
- Role-based access control
- Account activation/deactivation

## API Endpoints

### 1. Golf Course User Login

**POST** `/api/golf-course/[courseId]/auth/login`

Authenticates a user for a specific golf course.

**Parameters:**
- `courseId`: Golf course ID (URL parameter)

**Request Body:**
```json
{
  "username": "john_staff",
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
    "username": "john_staff",
    "email": "john@golfcourse.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "golfCourse": {
      "id": 1,
      "name": "Pine Valley Golf Club"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/golf-course/1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_staff",
    "password": "securepassword123"
  }'
```

### 2. List Golf Course Users

**GET** `/api/golf-course/[courseId]/users`

Lists all users for a specific golf course. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "john_staff",
      "email": "john@golfcourse.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "golfCourse": {
    "id": 1,
    "name": "Pine Valley Golf Club"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/golf-course/1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create Golf Course User

**POST** `/api/golf-course/[courseId]/users`

Creates a new user for a specific golf course. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "username": "jane_manager",
  "password": "securepassword123",
  "email": "jane@golfcourse.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "jane_manager",
    "email": "jane@golfcourse.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "GolfCourse": {
      "id": 1,
      "name": "Pine Valley Golf Club"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/golf-course/1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_manager",
    "password": "securepassword123",
    "email": "jane@golfcourse.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "MANAGER"
  }'
```

### 4. Get Specific User

**GET** `/api/golf-course/[courseId]/users/[userId]`

Gets details for a specific user. Requires authentication.

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
    "username": "john_staff",
    "email": "john@golfcourse.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "GolfCourse": {
      "id": 1,
      "name": "Pine Valley Golf Club"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/golf-course/1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update User

**PUT** `/api/golf-course/[courseId]/users/[userId]`

Updates a user's information. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "email": "john.doe@golfcourse.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "MANAGER",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_staff",
    "email": "john.doe@golfcourse.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "GolfCourse": {
      "id": 1,
      "name": "Pine Valley Golf Club"
    }
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/golf-course/1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@golfcourse.com",
    "role": "MANAGER"
  }'
```

### 6. Delete User

**DELETE** `/api/golf-course/[courseId]/users/[userId]`

Deletes a user from the golf course. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/golf-course/1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## User Roles

The system uses three defined roles with hierarchical permissions:

- **OWNER**: Full ownership access to golf course management (highest level)
- **MANAGER**: Management-level access to golf course operations
- **STAFF**: Standard staff access for day-to-day operations (lowest level)

**Role Hierarchy**: OWNER > MANAGER > STAFF

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid credentials or token)
- `404` - Not Found (golf course or user not found)
- `409` - Conflict (username already exists)
- `500` - Internal Server Error

Example error response:
```json
{
  "error": "Username already exists for this golf course"
}
```

## Usage Examples

### Creating Users for Multiple Golf Courses

```bash
# Create user for Golf Course 1
curl -X POST http://localhost:3000/api/golf-course/1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "pass123", "role": "STAFF"}'

# Create user with same username for Golf Course 2 (allowed)
curl -X POST http://localhost:3000/api/golf-course/2/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "pass123", "role": "STAFF"}'
```

### User Login Flow

```bash
# 1. Login as golf course user
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/golf-course/1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "pass123"}')

# 2. Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 3. Use token for authenticated requests
curl -X GET http://localhost:3000/api/golf-course/1/users \
  -H "Authorization: Bearer $TOKEN"
```

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens include golf course context in the role field
- Username uniqueness is enforced per golf course
- Account activation/deactivation support
- Protected routes require valid authentication 