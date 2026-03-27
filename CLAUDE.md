# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern used car showroom management system with public-facing frontend and admin panel backend.

**Tech Stack:**
- Frontend: Vue 3 + Vite + Element Plus + Pinia
- Backend: Node.js + Express + MySQL
- Key libs: Axios, Multer (uploads), Sharp (image processing), JWT (auth)

## Development Commands

From root directory:
```bash
npm run install:all    # Install all dependencies (backend + frontend)
npm run dev            # Start both frontend (5173) and backend (3000) concurrently
npm run dev:backend    # Backend only (with nodemon)
npm run dev:frontend   # Frontend only (Vite)
npm run build:frontend # Build frontend for production
npm run start:backend  # Start backend in production mode
```

From backend/:
```bash
npm run dev            # Development server with nodemon
npm start              # Production server
npm run dev:clean      # Kill port 3000 then start nodemon
npm run kill-port      # Kill process on port 3000
```

From frontend/:
```bash
npm run dev            # Development server (Vite)
npm run build          # Production build
npm run preview        # Preview production build
```

## Architecture

### Backend Structure
- `server.js` - Express entry point, mounts routes, serves static uploads, handles errors
- `config/database.js` - MySQL connection pool config, connection testing with retries
- `initDatabase.js` - Creates all tables, inserts test data. Runs on server start.
- `routes/` - Express route handlers (cars, recommendations, popular, sales, statistics)
- `controllers/` - Business logic for each route
- `uploads/` - Static file directory for uploaded images (served at `/uploads`)
- `.env` - Database credentials (PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)

### Frontend Structure
- `main.js` - Vue app entry, registers Element Plus components and icons
- `router/index.js` - Vue Router config with nested admin routes
- `utils/api.js` - Axios instance with interceptors for auth tokens. Exposes `carAPI`, `recommendationAPI`, `popularAPI`, `salesAPI`, `statisticsAPI`
- `views/` - Public pages (Home, Cars, CarDetail)
- `views/admin/` - Admin panel (CarManagement, AddCar, EditCar, RecommendationManagement, PopularManagement, SalesManagement, Statistics)
- `components/` - Reusable components (CarCard, layout components)
- Uses Vite environment variable `VITE_API_BASE_URL` for API base URL

### Database Schema
**Core tables:**
- `users` - Authentication and roles (admin/user)
- `cars` - Main vehicle data with indexes on brand, model, year, price, status
- `car_images` - Vehicle images with `is_main` flag, foreign key to cars
- `orders` - Sales orders linking users to cars
- `favorites` - User favorites (unique constraint on user_id + car_id)
- `reviews` - User reviews with 1-5 rating
- `recommendations` - Admin-curated recommended vehicles with priority
- `popular_cars` - Popular vehicles tracked by view count

**Important:** Database is automatically initialized on server startup via `initDatabase.js`. This creates tables and inserts test data if they don't exist.

### Request Flow
1. Frontend calls API via `utils/api.js` (Axios)
2. Token added to Authorization header from localStorage
3. Backend route → controller → database query
4. Response intercepted by frontend and unwrapped

## Environment Variables

**Backend (.env):**
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
```

**Frontend (.env):**
```
VITE_API_BASE_URL=/api  # Points to backend at http://localhost:3000/api in dev
```

**Deployment:** Railway provides MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT env vars.

## Key Implementation Details

- **Image Uploads:** Uses Multer for multipart form data, Sharp for image processing. Uploads to `backend/uploads/` and returns URLs at `/uploads/filename`
- **Auth:** JWT tokens stored in localStorage, sent in Authorization header on API calls
- **Database:** MySQL with utf8mb4 charset for Chinese character support. Connection pooling with 10 connection limit
- **Error Handling:** Express error middleware catches errors, returns JSON with error message
- **Development:** Backend runs with nodemon (auto-restart), frontend with Vite HMR
- **Deployment:** Frontend on Vercel, backend + MySQL on Railway

## Default Credentials

- Admin: `admin` / `admin123`
