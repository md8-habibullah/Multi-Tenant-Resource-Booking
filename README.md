# Multi-Tenant Resource Booking & Availability System

[![Live Demo](https://img.shields.io/badge/Live_Demo-calendeee.habibullah.dev-blue?style=for-the-badge&logo=vercel)](https://calendeee.habibullah.dev/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger_UI-85EA2D?style=for-the-badge&logo=swagger)](https://calendeee.habibullah.dev/api-docs)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)]()

**Live Production URL:** [https://calendeee.habibullah.dev/](https://calendeee.habibullah.dev/)
**Live API Documentation:** [https://calendeee.habibullah.dev/api-docs/](https://calendeee.habibullah.dev/api-docs/)

---

## Core Architectural Highlights

This backend is designed with a heavy emphasis on data integrity, scalable isolation, and production-grade reliability. The architecture is explicitly designed to handle the complex edge cases associated with multi-tenant scheduling across various time zones.

- **Strict Tenant-Level Data Isolation:** Every API request is strictly scoped to the authenticated user's `organizationId`. A custom RBAC (Role-Based Access Control) middleware enforces a rigid boundary between `EMPLOYEE` and `ORG_ADMIN` operations. This ensures complete data siloing between tenants.
- **Transactional Booking Safety (Atomic Operations):** The availability engine prevents race conditions and double-booking using true **MongoDB Transactions**. All time-slot checks, availability validations, and booking insertions are wrapped in an atomic Mongoose session—mathematically guaranteeing no overlapping bookings occur, even under extreme high-concurrency environments.
- **Timezone-Aware Availability Engine:** Global scheduling is fundamentally complex. This engine utilizes **Luxon** to execute timezone-agnostic arithmetic. It dynamically slices working shifts (including complex overnight shifts), subtracts pre-existing bookings, and cleanly applies geometric buffer times to calculate open slots in real-time.
- **Strict Environment Validation:** Boot-time validation powered by **Zod** instantly crashes the application if crucial environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) are missing or malformed, preventing silent failures during deployment.
- **Secure Cookie Sessions:** Authentication flows strictly utilize `HTTP-Only` cookies with `SameSite=strict` and `Secure` flags in production to protect JWTs from Cross-Site Scripting (XSS) attacks.

---

## Project Folder Structure Map

The codebase leverages a modular, Domain-Driven Design (DDD) to keep concerns cleanly separated and highly maintainable as the system scales.

```text
src
├── app.ts                  # Express application setup & global middlewares
├── config
│   ├── database.ts         # MongoDB connection logic
│   └── env.ts              # Zod environment variable validation
├── docs
│   └── swagger.ts          # OpenAPI specification config & endpoints
├── middlewares
│   ├── auth.ts             # Secure cookie validation and RBAC enforcement
│   └── errorHandler.ts     # Global centralized error handling mechanism
├── modules                 # Domain modules (Clean functional exports)
│   ├── auth                # Registration, Login, and Session management
│   ├── bookings            # Availability Engine and Booking reservations
│   ├── members             # Organization user listing
│   ├── organizations       # Tenant configuration (Timezones, Working Hours)
│   └── resources           # Bookable assets (Rooms, Desks) with buffers
├── server.ts               # HTTP server boot script
└── types                   # Custom TypeScript definitions
```

---

## Prerequisites & Tech Stack

This project was architected, built, and tested entirely on a Linux-based operating system. Ensure you have the following installed before proceeding with local development:

- **Node.js** (v26+)
- **TypeScript** (v6+)
- **MongoDB** (Local instance or Atlas URI)

**Core Engineering Stack:**
- **Express.js** - Robust, lightweight HTTP routing.
- **Mongoose** - Elegant MongoDB object modeling.
- **Zod** - TypeScript-first schema validation.
- **Luxon** - Powerful, timezone-aware date math.
- **Jest & Supertest** - Comprehensive integration testing pipeline.
- **Swagger JSDoc/UI** - Interactive, self-updating API documentation.

---

## Installation & Local Setup

**1. Clone the repository and install dependencies:**
```bash
npm install
```

**2. Configure Environment Variables:**
Copy the example file and update it with your actual connection details.
```bash
cp .env.example .env
```

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The HTTP port the server will bind to | `5000` |
| `MONGO_URI` | Your MongoDB connection string | `mongodb://localhost:27017/multi-tenant-booking` |
| `JWT_SECRET` | Secret key for signing JWT cookies | `your_super_secret_jwt_key` |
| `NODE_ENV` | Application environment state | `development` |

**3. Boot the Server:**
```bash
npm run dev
```

---

## Troubleshooting: How to Clear Blocked Ports on Linux

> [!TIP]
> If you encounter an `EADDRINUSE` error indicating that `:::5000` is already in use, it means a previous Node.js process crashed or was sent to the background without properly releasing the port.

On Linux, you can instantly terminate whatever is blocking your port using the `fuser` command:

```bash
fuser -k 5000/tcp
```
**How it works:** 
- `fuser` identifies the Process ID (PID) currently squatting on TCP port 5000.
- The `-k` (kill) flag sends a `SIGKILL` signal directly to that stale process, instantly freeing up the port so you can start your development server again.

---

## API Endpoints Overview

Once the server is running, you can interact with the API or view the detailed Swagger documentation at `http://localhost:5000/api-docs` or via the production URL at `https://calendeee.habibullah.dev/api-docs`.

### Auth
- `POST /api/auth/register` - Provision a new tenant/organization & Admin.
- `POST /api/auth/employee` - Onboard a standard employee.
- `POST /api/auth/login` - Authenticate and receive an HTTP-Only cookie.
- `POST /api/auth/logout` - Clear the session cookie.

### Organizations & Members
- `GET /api/organizations` - Fetch standard tenant operational config.
- `PUT /api/organizations` - Update tenant working hours & timezone (Admin only).
- `GET /api/organizations/me` - Fetch my organization details.
- `GET /api/members` - List all users within the tenant.

### Resources
- `POST /api/resources` - Create a bookable asset with mandatory buffer times.
- `GET /api/resources` - List all assets in the organization.

### Bookings & Availability Engine
- `GET /api/bookings/availability/:resourceId?date=YYYY-MM-DD` - Dynamically calculate open time blocks.
- `POST /api/bookings` - Attempt a transactional booking.
- `GET /api/bookings/my` - List all personal bookings.
- `DELETE /api/bookings/:id` - Cancel a booking securely.
