# Conclave — Expert Session Booking Platform

A production-grade real-time expert booking system. Book focused sessions with world-class practitioners across business, technology, finance, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4 |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion 11 |
| HTTP Client | Axios |
| Backend | Node.js 24, Express 4 |
| Real-time | Socket.io 4 |
| Database | MongoDB Atlas + Mongoose 8 |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
expert-booking/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Error handling, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── sockets/         # Socket.io setup
│   ├── utils/           # asyncHandler, seed script
│   ├── server.js        # Entry point
│   ├── render.yaml      # Render deployment config
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Button, Card, Input, Badge, etc.
    │   │   ├── layout/      # Navbar
    │   │   ├── experts/     # ExpertCard, SlotPicker, SearchFilters
    │   │   └── bookings/    # BookingForm, StatusBadge
    │   ├── lib/             # api.js, socket.js, utils.js
    │   ├── pages/           # ExpertsPage, ExpertDetailPage, MyBookingsPage
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json
    └── .env.example
```

---

## Local Development Setup

### Prerequisites

- Node.js 22+
- MongoDB Atlas account (free tier works)

### 1. Clone & install

```bash
git clone <repo-url>

# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure environment variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/expert-booking?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This populates MongoDB with 12 realistic expert profiles, each with 14 days of available time slots.

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `CLIENT_URL` — your Vercel frontend URL
   - `NODE_ENV=production`

### Frontend → Vercel

1. Import project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variables:
   - `VITE_API_URL` — `https://your-render-app.onrender.com/api`
   - `VITE_SOCKET_URL` — `https://your-render-app.onrender.com`
4. Deploy

---

## API Reference

### Experts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts with search, filter, pagination |
| GET | `/api/experts/categories` | Get all expert categories |
| GET | `/api/experts/:id` | Get expert by ID with grouped slots |

**GET /api/experts query params:**
- `search` — string, searches name/title/tags
- `category` — string, filter by category
- `page` — integer (default: 1)
- `limit` — integer (default: 9, max: 50)
- `sort` — string (default: `-rating`)

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings?email=` | Get bookings for an email |
| PATCH | `/api/bookings/:id/status` | Update booking status |

**POST /api/bookings body:**
```json
{
  "expertId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "date": "YYYY-MM-DD",
  "timeSlot": "HH:MM",
  "notes": "string (optional)"
}
```

**PATCH /api/bookings/:id/status body:**
```json
{ "status": "Pending | Confirmed | Completed | Cancelled" }
```

---

## Key Architecture Decisions

### Double Booking Prevention

Two layers of protection:

1. **Atomic MongoDB update** — uses `findOneAndUpdate` with a query that only matches when `isBooked: false`, so concurrent requests cannot both succeed
2. **Compound unique index** — `{ expert, date, timeSlot }` unique index on the Booking collection acts as a final database-level safety net

### Real-Time Slot Updates

- Clients join an expert-specific Socket.io room (`expert:<id>`) when viewing the detail page
- When any booking is created, the server emits `slot:booked` to that room
- All connected clients immediately disable that slot in their UI without a page refresh

### Error Handling

- Global Express error middleware handles all thrown errors
- Mongoose duplicate key (11000), validation errors, and CastErrors are all mapped to meaningful HTTP responses
- Frontend Axios interceptor normalizes all API errors to a single `Error.message` string

---

## Design System

The UI uses **Palette 4** from the brief as the primary system:

| Token | Value | Usage |
|---|---|---|
| Ocean 900 | `#003049` | Primary text, buttons, headings |
| Ocean 700 | `#2C7F91` | Links, focus rings, accents |
| Ocean 400 | `#A7BED3` | Borders, rings |
| Ocean 200 | `#C6CADA` | Avatar backgrounds |
| Ocean 50 | `#F2F2F2` | Backgrounds, inactive states |
| Sage 600 | `#5E8374` | Success states, live indicator |
| Gold | `#C9A84C` | Star ratings |
| Warm 100 | `#F8F7F5` | Page background |

Typography: **DM Serif Display** (headings) + **DM Sans** (body).
