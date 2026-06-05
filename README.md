# Multi-Tenant Resource Booking API

A highly scalable, multi-tenant resource booking and availability engine built strictly using Domain-Driven Design patterns in Node.js, Express, TypeScript, MongoDB, and Luxon.

## Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Time Engine**: Luxon

## Project Structure
```text
src/
├── app.ts                 # Express setup and central routing
├── server.ts              # Entry point with DB connection
├── config/
│   └── database.ts        # Mongoose setup
├── middlewares/
│   ├── auth.ts            # JWT verification & RBAC
│   └── errorHandler.ts    # Centralized Zod/Mongoose error handling
└── modules/
    ├── auth/              # Registration, Login, User models
    ├── bookings/          # Luxon Availability Engine & Booking CRUD
    ├── organizations/     # Tenant settings (working hours, timezones)
    └── resources/         # Resource configuration with buffer times
```

## Running the Project

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

> **Note**: Ensure your `.env` contains valid `MONGO_URI`, `JWT_SECRET`, and `PORT`.

## API Documentation

All protected routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <JWT>`

### Auth Module
- `POST /api/auth/register` - Register a new organization admin.
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

## Run Tests
An end-to-end audit test script `qa-test.sh` is provided. Run the server, then execute:
```bash
bash qa-test.sh
```
