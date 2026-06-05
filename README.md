# Multi-Tenant Resource Booking API

A highly scalable, multi-tenant resource booking and availability engine built strictly using Domain-Driven Design patterns in Node.js, Express, TypeScript, MongoDB, and Luxon.

## Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Time Engine**: Luxon

## Features
- **Strict Tenant Isolation**: All endpoints natively filter via `req.user.organizationId` avoiding cross-tenant data leaks.
- **Dynamic Availability Engine**: Built with Luxon to properly subtract existing bookings and calculate open slots within organization working hours.
- **Buffer Padding Algebra**: Dynamically factors in resource-specific buffers (before/after bookings) during overlap math, ensuring meetings never clip each other.

## Running the Project Locally

### 1. Environment Setup
Copy the example environment file and customize your variables:
```bash
cp .env.example .env
```
Ensure your `.env` contains valid a `MONGO_URI`, `JWT_SECRET`, and `PORT`.

### 2. Install & Run
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## API Documentation

All protected routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <JWT>`

### Auth Module
- `POST /api/auth/register` - Register a new organization admin (Returns a JWT token).
- `POST /api/auth/login` - Login to receive a JWT.

### Organizations Module
- `GET /api/organizations` - Get the current organization's settings.
- `PUT /api/organizations` - Update organization timezone and working hours. (Requires `ORG_ADMIN`)

### Resources Module
- `GET /api/resources` - List all active resources for the organization.
- `GET /api/resources/:id` - Get a specific resource.
- `POST /api/resources` - Create a new resource with buffer times. (Requires `ORG_ADMIN`)
- `PUT /api/resources/:id` - Update an existing resource. (Requires `ORG_ADMIN`)
- `DELETE /api/resources/:id` - Soft delete a resource. (Requires `ORG_ADMIN`)

### Bookings Module
- `POST /api/bookings` - Create a new booking for a resource. Ensures overlap protection using complex buffer algebra and strictly verifies organization shift hours.
- `GET /api/bookings/availability/:resourceId?date=YYYY-MM-DD` - Calculates free time slots dynamically using Luxon, strictly subtracting existing bookings and precise buffer padded times.

## Running Automated QA Tests
An end-to-end audit test script `run-tests.sh` is provided. While the server is running (`npm run dev`), execute the bash script:
```bash
bash run-tests.sh
```
