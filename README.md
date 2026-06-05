# Multi-Tenant Resource Booking API

**Author:** MD. HABIBULLAH SHARIF

A highly scalable, multi-tenant resource booking and availability engine engineered for complex scheduling scenarios. Built with Node.js, Express, TypeScript, and MongoDB, this platform securely isolates organizational data while handling advanced time algebra.

## Architecture Overview

This project adheres to **Domain-Driven Design (DDD)** principles to ensure scalability and maintainability:
- **Modular Domains:** The codebase is partitioned into distinct modules (`auth`, `organizations`, `resources`, `bookings`), each encapsulating its own models, services, controllers, and routing.
- **Strict Tenant Isolation:** Multi-tenancy is enforced natively at the service level. Every database query implicitly filters by the authenticated user's `organizationId`, preventing cross-tenant data leaks by design.
- **Service-Oriented Logic:** Business rules (such as buffer calculations and timezone math) are completely decoupled from HTTP transport layers (controllers), ensuring pure, testable operations.
- **Secure Session Management:** The API utilizes robust, Secure, HTTP-Only cookies to manage JSON Web Tokens (JWT). This architecture explicitly neutralizes Cross-Site Scripting (XSS) vulnerabilities by preventing client-side JavaScript access to the tokens, while strict `sameSite` policies mitigate CSRF vectors.

## The Availability Engine

The core of the system is the **Availability Engine**, which dynamically computes free scheduling blocks:
1. **Shift Resolution:** Resolves the organization's absolute UTC working boundaries, natively supporting cross-day shifts (e.g., 22:00 to 06:00) using localized Luxon timezone configurations.
2. **Buffer Algebra:** Automatically fetches all existing bookings for the requested date and injects the resource's mandatory `bufferTimeBefore` and `bufferTimeAfter` (in minutes).
3. **Iterative Slicing:** Algebraically sweeps through the organization's working hours, strictly subtracting the padded booking segments to output an array of genuinely bookable time spans.

## Assumptions & Handled Edge Cases

- **Cross-Day Timezones:** Working hours spanning across midnight (e.g., a hospital shift) are seamlessly supported. If an employee books a slot at `02:00` during an overnight shift, the engine intelligently ties the booking to the logical "shift day" from the previous calendar date.
- **Concurrency & Overlap Prevention:** The booking creation endpoint uses an advanced mathematical inequality constraint (`newStart - totalBuffer < existingEnd` AND `newEnd + totalBuffer > existingStart`) at the MongoDB query level to prevent race conditions and overlapping bookings.
- **Role-Based Access Control (RBAC):** `EMPLOYEE` accounts can only calculate availability and book resources, while `ORG_ADMIN` accounts handle configuration and resource provisioning.

## Docker Deployment

This project is fully containerized for a zero-friction setup.

### 1. Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
MONGO_URI=mongodb://mongodb:27017/multi-tenant-booking
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
```

### 2. Boot the Cluster
Use Docker Compose to build and start both the API and the MongoDB instance in detached mode:
```bash
docker compose up -d --build
```
*The API will be accessible at `http://localhost:5000`.*

### 3. API Documentation
Once running, interactive Swagger documentation is exposed at:
👉 **http://localhost:5000/api-docs**

### 4. Tearing Down
To stop and remove the containers, networks, and volumes:
```bash
docker compose down
```

## Running the Test Suite
Four comprehensive test suites are provided in the `/tests` directory. While the environment is running, execute:
```bash
# Verify End-to-End API flows
bash tests/run-tests.sh

# Verify comprehensive QA scenarios
bash tests/qa-test.sh

# Verify Role-Based Security overrides
bash tests/rbac-test.sh

# Verify core Domain Logic (Availability Engine)
npx ts-node tests/test-engine.ts
```
