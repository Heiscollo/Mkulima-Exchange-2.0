# Backend Setup Guide

## Prerequisites
- Node.js v18+
- PostgreSQL database (or Supabase account)
- Cloudinary account
- Africa's Talking account
- Safaricom Daraja (M-Pesa) sandbox account

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```
Fill in your credentials in the `.env` file.

3. **Set up database**
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Seed sample data
npm run prisma:seed
```

4. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run db:push` - Push schema changes to DB
- `npm run db:studio` - Open Prisma Studio (visual DB browser)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database models
│   └── seed.js            # Sample data
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth, validation, errors
│   ├── routes/            # API endpoints
│   └── utils/             # Helper functions
├── .env.example           # Example environment variables
├── index.js               # Server entry point
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `POST /api/auth/logout` - Logout user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (farmer only)
- `PATCH /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/accept` - Accept order
- `PATCH /api/orders/:id/deliver` - Mark delivered

### Payments
- `POST /api/payments/initiate/:orderId` - Start M-Pesa payment
- `POST /api/payments/callback` - Daraja webhook
- `GET /api/payments/:orderId` - Check payment status

### Reviews
- `POST /api/reviews` - Post review
- `GET /api/reviews/:userId` - Get user reviews

## Next Steps

1. Implement auth controllers with OTP logic
2. Implement listing CRUD operations
3. Implement order management
4. Integrate M-Pesa Daraja API
5. Integrate Africa's Talking SMS
6. Implement review system
7. Add error handling and validation
8. Add logging
9. Add API documentation (Swagger/OpenAPI)
10. Deploy to Render.com

---
