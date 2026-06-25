# Peppa Backend API

Node.js + Express + PostgreSQL + Sequelize backend for the Peppa mobile app.

**Location:** `c:\Users\monis\StudioProjects\peppa_backend` (sibling to `peppa_init` Flutter app)

## Stack

- Node.js 20+
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT + refresh token rotation
- Zod validation
- Google Gemini (`gemini-2.0-flash`)

## Quick Start

```bash
cd c:\Users\monis\StudioProjects\peppa_backend
cp .env.example .env
# Edit .env with your PostgreSQL and GEMINI_API_KEY

npm install
createdb peppa   # or create DB in pgAdmin

npm run db:migrate
npm run db:seed
npm run dev
```

API base: `http://localhost:3000/api/v1/mobile`

Health check: `GET /health`

## Mobile API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register (email/password) |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout (Bearer token) |
| GET/PATCH | `/profile` | User profile |
| POST | `/households` | Create household |
| GET | `/households/current` | Current household |
| POST | `/households/invite` | Email invite |
| POST | `/households/invites/:token/accept` | Accept invite |
| POST | `/households/join` | Join by invite code |
| GET/POST/PATCH/DELETE | `/households/members` | Family profiles (max 6) |
| PUT | `/households/cuisines` | Set cuisine preferences |
| GET | `/cuisines` | List cuisines |
| GET/POST/PATCH/DELETE | `/pantry/*` | Pantry management |
| GET | `/grocery-catalog` | Search master catalog |
| GET | `/recipes/recommend` | Gemini recipe suggestions |
| GET/POST | `/recipes/:id` | Recipe detail, cook, rate |
| GET/POST | `/shopping-list/*` | Shopping list |
| GET | `/nutrition/summary` | Nutrition dashboard |
| POST | `/ai/chat` | AI Chef chat |

## Flutter Integration

Update Flutter `ApiEndpoints.baseUrl` to:

```
http://10.0.2.2:3000/api/v1/mobile   # Android emulator
http://localhost:3000/api/v1/mobile  # iOS simulator
```

## Admin Dashboard (Sprint 7)

**UI:** `http://localhost:3000/admin` (or `http://192.168.31.216:3000/admin` on LAN)

**API base:** `/api/v1/admin`

Default super admin (created by seeder):

| Field | Value |
|-------|-------|
| Email | `admin@peppa.app` |
| Password | `Admin123!` |

Run seeder after migrate: `npm run db:seed`

### Admin API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Admin login |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout |
| GET | `/auth/profile` | Admin profile |
| GET | `/dashboard/stats` | Platform stats |
| GET | `/users` | List mobile users |
| PATCH | `/users/:id/status` | Suspend / activate user |
| GET | `/households` | List households |
| GET | `/households/:id` | Household detail |
| PATCH | `/households/:id/status` | Deactivate household |
| GET/POST/PATCH/DELETE | `/catalog` | Grocery catalog CRUD |
| GET/POST/PATCH | `/categories` | Pantry categories |
| GET/POST/PATCH | `/cuisines` | Cuisine types |
| GET/POST/PATCH/DELETE | `/gemini/prompts` | Prompt templates |
| GET/POST/PATCH/DELETE | `/gemini/keywords` | Gemini keywords |
| GET | `/gemini/usage` | AI usage logs |
| GET | `/activity-logs` | Audit trail |

## Admin APIs (legacy note)

Super Admin dashboard is live at `/admin` — Sprint 7 complete.

## Project Structure

```
src/
├── config/
├── database/ (models, migrations, seeders)
├── middleware/
├── modules/ (auth, households, pantry, recipes, ...)
├── routes/mobile/
├── services/ (gemini, email, activity)
├── app.js
└── server.js
```

## Auth Response Format

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "...", "email": "...", "full_name": "..." }
  }
}
```

Use header: `Authorization: Bearer <accessToken>`
