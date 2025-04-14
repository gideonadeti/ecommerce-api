# E-Commerce API

An API for an e-commerce platform.

## Features

- User authentication (sign-up, sign-in, sign-out)
- Product management (Admin-only: add, update, delete products)
- Product search with filtering, sorting, and pagination
- Cart management (add, update, remove items)
- Checkout and pay using Stripe
- Orders are automatically created after successful payments

## Tech Stack

- **Backend:** NestJS
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** Passport + JWT + Cookies
- **Payments:** Stripe
- **Deployment:** Render

## Installation

```bash
git clone https://github.com/gideonadeti/ecommerce-api.git
cd ecommerce-api
npm install
```

## Environment Setup

Create a `.env` file based on `.env.example` and configure:

```bash
DATABASE_URL="postgresql://<your-supabase-url>"
DIRECT_URL="postgresql://<your-supabase-url>"
JWT_ACCESS_SECRET="<your-jwt-access-secret>" (you can use `openssl rand -base64 32` to generate a random secret)
JWT_REFRESH_SECRET="<your-jwt-refresh-secret>"
STRIPE_SECRET_KEY="<your-stripe-secret-key>" (from your stripe dashboard)
STRIPE_WEBHOOK_SIGNING_SECRET="<your-webhook-secret>" (after installing  stripe cli and running `stripe listen --forward-to localhost:3000/webhooks/stripe`)
FRONTEND_BASE_URL="http://localhost:3001"
```

## Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Run the Project

```bash
npm run start:dev
```

Swagger docs available at: `http://localhost:3000/api/documentation`

## Live Deployment

Check out the live API on [Render](https://ecommerce-api-7cmw.onrender.com/api/documentation)

## Background

This project is based on the [roadmap.sh](https://roadmap.sh) backend roadmap challenge:  
[E-Commerce API Project](https://roadmap.sh/projects/ecommerce-api)
