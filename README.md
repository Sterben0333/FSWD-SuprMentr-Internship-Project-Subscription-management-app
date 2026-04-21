# 📋 Subscription Management App

A full-stack application to track subscriptions, automate billing reminders, and visualize spending analytics.

## Tech Stack

- **Frontend**: React 18 + Vite, Zustand, Recharts, Vanilla CSS
- **Backend**: Node.js + Express, Mongoose
- **Database**: MongoDB Atlas
- **Auth**: JWT (jsonwebtoken + bcryptjs)

## Features

- ✅ Add/edit/delete subscriptions with category tagging
- ✅ Smart billing: auto-calculate next payment dates (monthly/yearly/custom)
- ✅ Subscription lifecycle intelligence (active/trial/expiring/cancelled)
- ✅ Analytics dashboard with charts (spending trends, category breakdown)
- ✅ In-app notification system with reminders
- ✅ Dark/Light mode with premium glassmorphic UI
- ✅ Budget limit alerts
- ✅ PDF report export

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Installation
```bash
# Install all dependencies
npm run install:all

# Copy environment template
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret

# Seed categories
npm run seed

# Start development servers
npm run dev
```

### Environment Variables
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |

## Project Structure

```
├── client/    # React + Vite frontend
├── server/    # Node.js + Express backend
└── package.json  # Root scripts
```
