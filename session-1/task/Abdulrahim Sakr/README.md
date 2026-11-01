# 🏗️ Node.js + Express + TypeScript — Production Starter Template

A clean, scalable, production-ready backend starter template designed for reuse across enterprise-level projects.

## ⚡ Quick Start

```bash
# 1. Clone and install
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Start development server
pnpm dev

# 4. Verify it works
curl http://localhost:5000/api/v1/health
```

## 📁 Project Structure

```
src/
├── app.ts                          # Express app configuration (middleware, routes)
├── server.ts                       # Server entry point & lifecycle (sockets, crons, shutdown)
│
├── DB/                             # Database layer
│   └── database.ts                 # Database connection setup
│
├── config/                         # Configuration & environment
│   ├── env.ts                      # Centralized environment variables validation & retrieval
│   └── logger.ts                   # Pino logger setup for structured logging
│
├── middlewares/                    # Express middlewares
│   ├── authenticate.ts             # JWT authentication middleware
│   ├── authorize.ts                # Role-based access control middleware
│   ├── handle.global.error.ts      # Global Express error handler middleware
│   ├── handle.route.not.found.ts   # 404 handler middleware
│   ├── limit.auth.requests.ts      # Rate limiter for auth endpoints
│   ├── limit.requests.ts           # Global rate limiter
│   ├── log.requests.ts             # HTTP request logging middleware (morgan)
│   ├── multer.upload.ts            # Multer file upload setup
│   └── validate.ts                 # Zod request validation middleware
│
├── modules/                        # Feature modules (domain-driven)
│   ├── auth/                       # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.route.ts
│   │   ├── auth.validator.ts
│   │   ├── auth.dto.ts
│   │   ├── auth.type.ts
│   │   └── auth.model.ts
│   ├── user/                       # User management module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.route.ts
│   │   ├── user.validator.ts
│   │   ├── user.dto.ts
│   │   ├── user.type.ts
│   │   └── user.model.ts
│   └── health/                     # Health check endpoint
│       └── health.route.ts
│
└── shared/                         # Shared across modules (types, utils, jobs, tests)
    ├── jobs/                       # Scheduled cron jobs
    │   └── register.jobs.ts        # Register and configure all cron jobs
    ├── tests/                      # Testing helpers/infrastructure
    ├── types/                      # Shared TS Types
    │   ├── decode.token.types.ts
    │   ├── jwt.types.ts
    │   ├── multer.upload.types.ts
    │   ├── paymob.types.ts
    │   ├── shared.types.ts
    │   └── socketio.types.ts
    └── utils/                      # Shared utility functions
        ├── bcrypt.ts               # Password hashing helper
        ├── cloudinary/             # Cloudinary configuration & service
        │   ├── cloudinary.config.ts
        │   └── cloudinary.service.ts
        ├── crypto.ts               # AES encryption/decryption
        ├── decode.token.ts         # JWT decode (without verification)
        ├── error/                  # Custom error classes & helpers
        │   ├── app.error.ts        # AppError + subclasses
        │   └── async.handler.ts    # Async router wrapper
        ├── generate.otp.ts         # Secure OTP generator
        ├── jwt.ts                  # JWT sign/verify
        ├── paymob/                 # Paymob integration configuration & service
        │   ├── paymob.config.ts
        │   └── paymob.service.ts
        ├── response/               # Standardized response handlers
        │   ├── http.status.code.ts # HTTP status constants
        │   └── response.handler.ts # Standardized response builder
        ├── send-email/             # Email templates and sender service
        │   ├── generate.HTML.ts
        │   └── send.email.ts
        ├── socketio/               # Socket.IO setup and listeners
        │   ├── listeners/
        │   └── socket.io.server.ts
        └── stripe/                 # Stripe payment configuration & service
            ├── stripe.config.ts
            └── stripe.service.ts
```


## 🏛️ Architecture Decisions

### Why separate `app.ts` and `server.ts`?
- **app.ts** contains Express configuration — middleware, routes, error handlers
- **server.ts** handles server lifecycle — startup, shutdown, socket.io, cron jobs
- This separation allows **integration tests** to import `app` without starting an HTTP server

### Why modules instead of flat routes?
Each feature is self-contained with its own controller, service, route, validator, DTO, type, and model:
```
Route → Middleware → Controller → Service → Model
```
- **Controller**: Thin HTTP layer — extracts req data, calls service, sends response
- **Service**: Business logic — framework-agnostic, testable without Express
- **Model**: Data persistence — ORM/ODM interactions
- **Validator**: Zod schemas for runtime validation + TypeScript inference
- **DTO**: Data transformation — prevents leaking internal fields to clients

### Why AppError class hierarchy?
- `isOperational` flag distinguishes expected errors (bad input) from bugs (null pointer)
- Subclasses (`NotFoundError`, `UnauthorizedError`, etc.) provide semantic clarity
- The global error handler uses `instanceof` checks for type-safe error formatting

### Why centralized `env.ts`?
- Single source of truth for all environment variables
- Type-safe access with computed getters (`env.isDevelopment`)
- Easy to mock in tests — swap one import instead of stubbing `process.env`

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with hot reload (tsx watch) |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Run compiled production build |
| `pnpm lint` | Type-check without emitting files |

## 🔒 Security Features

- **Helmet** — Sets security HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — Configurable origin whitelist with preflight caching
- **Rate Limiting** — Global + strict per-route (auth endpoints: 10 req/15min)
- **JWT** — Separate access/refresh tokens with different secrets
- **Password Hashing** — bcrypt with 12 salt rounds
- **Input Validation** — Zod schemas on body, params, and query
- **Error Sanitization** — Stack traces hidden in production
- **Log Redaction** — Sensitive fields (passwords, tokens) auto-redacted from logs

## 🧩 Adding a New Module

1. Create folder: `src/modules/your-module/`
2. Create files following the naming convention:
   ```
   your-module.controller.ts
   your-module.service.ts
   your-module.route.ts
   your-module.validator.ts
   your-module.dto.ts
   your-module.type.ts
   your-module.model.ts
   ```
3. Register the route in `src/app.ts`:
   ```typescript
   import yourModuleRoutes from "./modules/your-module/your-module.route.js";
   app.use(`${API_PREFIX}/your-module`, yourModuleRoutes);
   ```

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| Express 5 | Modern web framework |
| TypeScript | Strict type safety |
| Zod | Declarative schema validation & type inference |
| Pino | Structured and high-performance logging |
| JWT | JSON Web Token authentication |
| bcrypt | Secure password hashing |
| Helmet | Security headers protection |
| CORS | Cross-origin resource sharing configuration |
| express-rate-limit | API rate limiting protection |
| Multer | Multipart file upload middleware |
| Nodemailer | Transactional email transmission |
| Socket.IO | Bi-directional, real-time events |
| node-cron | Lightweight cron scheduler |
| Cloudinary | Cloud-based media upload & optimization |
| Stripe | Global payment processing gateway |
| Paymob | Localized payment integration gateway |
| Redis | In-memory data structures cache |
| AWS SDK | Amazon S3 cloud storage integration |
| Google Gemini AI | Advanced generative AI integration |
| Firebase Admin SDK | Cross-platform push notifications |
| Puppeteer | Headless browser automation & web scraping |
| Fuse.js | Lightweight and powerful fuzzy searching |
| i18n | Application-wide internationalization |

## 📜 License

ISC
