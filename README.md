# 🌱 Mkulima Exchange

> **Connecting Kenyan farmers directly to buyers — no middlemen, no exploitation, fair pay every time.**

Mkulima Exchange is a final year Computer Science project built to solve a deeply rooted problem in Kenyan agriculture — smallholder farmers losing the majority of their earnings to exploitative middlemen. The platform lets farmers list their produce, negotiate prices directly with buyers, and receive payments securely through M-Pesa escrow, ensuring every farmer is paid fairly for their work.

---

## The Problem

In Kenya, most smallholder farmers sell through brokers and middlemen who buy produce at rock-bottom prices and resell at a significant markup. The farmer — who does all the work — often earns less than 30% of what the final buyer pays. Mkulima Exchange cuts out that chain entirely.

---

## What It Does

- **Farmers** create listings for their produce with photos, quantity, price, and location
- **Buyers** browse listings, filter by crop and county, and place orders directly
- **Both parties** can negotiate price before committing to a transaction
- **M-Pesa escrow** holds the buyer's payment until delivery is confirmed — the farmer is guaranteed to receive their money
- **SMS notifications** keep both parties informed at every step, even on basic phones
- **Trust scores** and reviews build reputation over time for both farmers and buyers

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML | Page structure |
| CSS | Styling and responsive layout |
| JavaScript | User interactions and API calls |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | API framework and routing |
| PostgreSQL | Primary database (hosted on Supabase) |
| Prisma | Database ORM |
| Safaricom Daraja API | M-Pesa STK Push and B2C payments |
| Africa's Talking | SMS notifications |
| Cloudinary | Produce image storage and delivery |
| JWT | Authentication and session management |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Hosted PostgreSQL database |
| Cloudinary | Image CDN |
| Render.com | Backend server hosting |
| GitHub | Version control |

---

## Project Structure

```
mkulima-exchange-website/
├── frontend/                   # Complete client-side application
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
└── backend/                    # Node.js REST API
    ├── prisma/
    │   ├── schema.prisma       # Database models
    │   └── seed.js             # Sample Kenyan produce data
    ├── src/
    │   ├── routes/             # API route definitions
    │   ├── controllers/        # Business logic
    │   └── middleware/         # Auth and role guards
    ├── .env.example            # Required environment variables
    ├── index.js                # Server entry point
    └── package.json
```

---

## API Overview

| Module | Endpoints | Description |
|---|---|---|
| Auth | `POST /api/auth/send-otp` `POST /api/auth/verify-otp` | Phone-based OTP login via SMS |
| Listings | `GET /api/listings` `POST /api/listings` | Browse and create produce listings |
| Orders | `POST /api/orders` `PATCH /api/orders/:id/accept` | Place orders and negotiate |
| Payments | `POST /api/payments/initiate/:id` | M-Pesa STK Push and escrow release |
| Reviews | `POST /api/reviews` `GET /api/users/:id/profile` | Ratings and trust scores |
| Admin | `GET /api/admin/stats` `GET /api/admin/disputes` | Platform management |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js v18 or higher
- A Supabase account (free)
- A Cloudinary account (free)
- An Africa's Talking sandbox account (free)
- A Safaricom Daraja sandbox account (free)

### Setup

1. Clone the repository
```bash
git clone https://github.com/Heiscollo/Mkulima-Exchange-2.0
cd mkulima-exchange-website/backend
```

2. Install dependencies
```bash
npm install
```

3. Create your environment file
```bash
cp .env.example .env
```
Then fill in your credentials in the `.env` file.

4. Run database migrations and seed data
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Start the development server
```bash
node index.js
```

The API will be running at `http://localhost:3000`. Test it by visiting `http://localhost:3000/api/health`.

---

## Environment Variables

```env
DATABASE_URL=                  # Supabase PostgreSQL connection string
JWT_SECRET=                    # Any long random string for signing tokens

CLOUDINARY_CLOUD_NAME=         # From Cloudinary dashboard
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

AFRICASTALKING_API_KEY=        # From Africa's Talking sandbox
AFRICASTALKING_USERNAME=

MPESA_CONSUMER_KEY=            # From Safaricom Daraja
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=               # Use 174379 for sandbox
MPESA_PASSKEY=
MPESA_CALLBACK_URL=            # Your public URL for Daraja callbacks
```

---

## How the M-Pesa Escrow Works

```
Buyer places order
       ↓
Farmer accepts
       ↓
Buyer pays via M-Pesa STK Push → Money held in escrow
       ↓
Farmer delivers produce
       ↓
Both parties confirm delivery
       ↓
Money released to farmer's M-Pesa automatically
```

If a dispute arises, an admin can intervene and trigger a refund to the buyer. The farmer never receives money until delivery is confirmed — and the buyer never loses money without recourse.

---

## Deployment

The backend is deployed on **Render.com** (free tier). The frontend is served as static files.

To deploy your own instance, follow the step-by-step guide in `backend/DEPLOYMENT.md`.

---

## Author

Collins Kithinji
Final Year BSc in Applied Computer Science
Daystar University
2026

---

## Acknowledgements

- Safaricom for the Daraja M-Pesa API
- Africa's Talking for accessible SMS infrastructure
- The Kenyan farming community whose challenges inspired this project

---
