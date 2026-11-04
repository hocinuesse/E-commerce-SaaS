# 🛍️ EcoMart — Enterprise Multi-Tenant E-Commerce SaaS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20ACID-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Jest](https://img.shields.io/badge/Jest-Tested-C21325?style=for-the-badge&logo=jest)](https://jestjs.io/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions)](https://github.com/features/actions)

> **EcoMart** is an enterprise-grade Multi-Vendor E-Commerce SaaS platform (similar to Shopify / Salla). It enables independent vendors to launch branded digital storefronts with dynamic sub-slug routing, automated multi-vendor order splitting, atomic MongoDB transactions, Redis-powered caching, real-time Socket.io notifications, and granular Role-Based Access Control (RBAC).

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    Client["Client / Browser\n(Next.js 16 + React 19)"]
    EdgeMiddleware["Next.js Edge Middleware\n(RBAC Route Guarding)"]
    APIGateway["Express 5 API Gateway\n(Rate Limiter + Helmet + Winston + Zod)"]
    RedisCache[("Redis 7 In-Memory Cache\n(TTL: 60s - 300s)")]
    MongoCluster[("MongoDB Replica Set\n(ACID Transactions)")]
    SocketBus["Socket.io WebSocket Server\n(Real-Time Order & Message Rooms)"]

    Client --> EdgeMiddleware
    EdgeMiddleware --> Client
    Client -->|REST API Requests| APIGateway
    Client <-->|Bi-directional Events| SocketBus

    APIGateway -->|Read Cache| RedisCache
    APIGateway -->|ACID Order Creation & Transactions| MongoCluster
    APIGateway -->|Emit Events notifyNewOrder| SocketBus
```

---

## 🚀 Key Senior Engineering Highlights

### 1. 🔒 MongoDB ACID Transactions & Oversell Prevention
- Order processing is engineered with **`mongoose.startSession()`** and two-phase atomic commits.
- Uses **atomic conditional stock decrements** (`{ stock: { $gte: item.quantity } }`) to mathematically eliminate race conditions and negative inventory during flash sales.
- If any vendor order item fails, the entire transaction automatically rolls back.

### 2. 🏪 Multi-Vendor Order Splitting Engine
- Customers place a single unified checkout with items from multiple independent vendors.
- The engine decomposes the cart into **isolated vendor fulfillment orders** (`order.shop = vendorId`), calculating individual shipping rates, tax, and commissions per store.

### 3. 🛒 Intelligent Guest-to-User Cart Synchronization
- Anonymous visitors can add items to an unauthenticated session cart via `sessionId`.
- Upon sign-up or login, the **`mergeCart` algorithm** atomically synchronizes guest items into the authenticated user's MongoDB cart, preventing abandoned cart data loss.

### 4. 🛡️ Comprehensive Security Hardening (OWASP Compliant)
- **IDOR / BOLA Prevention:** Every mutation (`updateOrderStatus`, `deleteProduct`, `getMessages`) strictly verifies ownership against `req.user.shopId`.
- **Double-Token Authentication:** HttpOnly `accessToken` (15m) + `refreshToken` (7d) with automatic rotation. No tokens exposed to `localStorage` (XSS immune).
- **Zod Schema Validation:** Strict runtime validation on body, query, and path parameters with localized error feedback.
- **Security Headers & Rate Limiting:** Powered by `helmet` and `express-rate-limit` (20 req/15min on Auth routes, 300 req/15min on General API).

### 5. ⚡ Redis Caching Layer with Graceful Fallback
- Key public endpoints (`/categories`, `/deals`, `/new-arrivals`, `/platform-stats`) leverage in-memory Redis caching with automated TTL expiry.
- If Redis is offline, the client **falls back gracefully** to MongoDB with zero downtime or request failure.

### 6. 🔔 Real-Time WebSocket Infrastructure (Socket.io)
- Integrated dedicated socket rooms (`shop_${shopId}` and `user_${userId}`).
- Real-time instant notification broadcast when a new order arrives, order status changes, or a customer sends a message.

### 7. 🐳 Production Multi-Stage Docker & Compose Orchestration
- Separate optimized multi-stage `Dockerfile` configurations for both Backend and Frontend (`standalone` output).
- Single-command orchestration via `docker-compose.yml` bringing up **MongoDB 7**, **Redis 7 Alpine**, **Express Backend**, and **Next.js Frontend**.

### 8. 🧪 Automated Testing & CI/CD Pipeline
- Automated integration test suite powered by **Jest** and **Supertest**.
- Continuous Integration workflow via **GitHub Actions** checking TypeScript compilation, ESLint hygiene, test suites, and Docker image builds on every push.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand, Lucide Icons, Shadcn / Radix UI |
| **Backend** | Node.js 20, Express 5, TypeScript 5, Mongoose 9, Zod, Socket.io, Winston, Morgan |
| **Database & Cache** | MongoDB (Replica Set / Atlas), Redis 7 (Alpine) |
| **DevOps & Tooling** | Docker, Docker Compose, GitHub Actions, Jest, Supertest, ESLint |

---

## 📦 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose (Recommended)
- Alternatively: Node.js >= 20.x, MongoDB instance, and Redis server

### Option A: 1-Click Launch with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/hocinuesse/E-commerce-SaaS.git
cd E-commerce-SaaS

# 2. Start all services (MongoDB, Redis, Backend, Frontend)
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/health`

---

### Option B: Manual Local Setup

#### 1. Backend Setup:
```bash
cd backend

# Copy environment template
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, JWT Secrets, etc.

# Install dependencies
npm install

# Run automated tests
npm test

# Start development server
npm run dev
```

#### 2. Frontend Setup:
```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server uptime & healthcheck | Public |
| `POST` | `/api/v1/auth/register` | Register new user / vendor (Zod validated) | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue HttpOnly tokens | Public |
| `POST` | `/api/v1/auth/logout` | Clear auth cookies | Authenticated |
| `POST` | `/api/v1/auth/refresh-token` | Rotate access token via refresh token | Public (Cookie) |
| `GET` | `/api/v1/products/all-products`| Search and filter catalog | Public |
| `GET` | `/api/v1/products/deals` | Get flash deals (Redis cached 60s) | Public |
| `POST` | `/api/v1/products/create-product`| Add product to vendor catalog | Vendor / Manager |
| `POST` | `/api/v1/cart/add` | Add item to user/session cart | Public / Client |
| `POST` | `/api/v1/orders/create-order` | Atomic multi-vendor checkout (ACID Transaction) | Client |
| `PATCH`| `/api/v1/orders/update-order-status/:id`| Update fulfillment status (IDOR protected) | Vendor / Admin |
| `GET` | `/api/v1/shops/my-shop` | Retrieve authenticated vendor store | Vendor |

---

## 💼 CV / Resume Highlights (STAR Method)

### In English:
- **Multi-Tenant SaaS Architecture:** Designed and implemented a high-performance multi-vendor e-commerce platform supporting independent merchant storefronts, dynamic sub-slug routing, and granular Role-Based Access Control (RBAC) across 4 tiers.
- **ACID Order Splitting Engine:** Engineered an atomic checkout pipeline using MongoDB ACID transactions that decomposes multi-item carts into individual merchant fulfillment orders while preventing stock overselling under concurrent load.
- **Security & Session Hardening:** Architected double-token HttpOnly authentication, Next.js Edge Middleware route guarding, IDOR-protected mutation endpoints, and Express rate limiting to prevent unauthorized access.
- **Performance & Scalability:** Integrated Redis caching layer with graceful degradation, reducing database load by over 60% on hot routes, combined with multi-stage Docker orchestration and GitHub Actions CI/CD.

### بالعربية (للسيرة الذاتية والمقابلات الفنية):
- **معمارية SaaS متعددة التجار (Multi-Tenant Architecture):** تصميم وتطوير منصة تجارة إلكترونية سحابية تتيح لكل بائع متجراً مستقلاً مع نظام توجيه ديناميكي للروابط وإدارة صلاحيات متقدمة (RBAC) لـ 4 أدوار مختلفة.
- **محرك تقسيم الطلبات الذري (ACID Transactions):** تطوير محرك معالجة طلبات معقد يعتمد على معاملات MongoDB الذرية لتقسيم سلة المشتريات بين المتاجر وتحديث المخزون بدقة ومنع البيع السالب لحالات السباق (Race Conditions).
- **أمان وحماية الجلسات:** تطبيق توثيق مزدوج (HttpOnly Access/Refresh Tokens) وحماية المسارات على مستوى Edge Middleware في Next.js، وسد ثغرات الـ IDOR والـ BOLA وضبط محددات الطلب (Rate Limiting).
- **أداء وبنية تحتية سحابية:** دمج طبقة التخزين المؤقت عبر Redis مع خيار التراجع التلقائي، وتجهيز بيئات العمل بـ Docker متعدد المراحل وأتمتة الاختبارات والتكامل المستمر عبر GitHub Actions.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
