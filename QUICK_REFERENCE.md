# Orders & Negotiation System - Quick Reference

## 🚀 Get Started

1. Generate Prisma client: `cd backend && npx prisma generate` ✅ Done
2. Start server: `npm start`
3. Order routes available at: `http://localhost:3000/api/orders`

---

## 📝 Endpoint Quick Reference

| Method | Endpoint | Who | Purpose |
|--------|----------|-----|---------|
| POST | /api/orders | Buyer | Create order |
| GET | /api/orders | Both | List own orders (+ status filter) |
| GET | /api/orders/:id | Both | View order details |
| PATCH | /api/orders/:id/accept | Farmer | Accept buyer's offer |
| PATCH | /api/orders/:id/reject | Farmer | Reject order (+ reason) |
| PATCH | /api/orders/:id/counter | Farmer | Send counter price (max 3) |
| PATCH | /api/orders/:id/accept-counter | Buyer | Accept counter offer |
| PATCH | /api/orders/:id/reject-counter | Buyer | Reject counter (auto-sets next round) |
| PATCH | /api/orders/:id/buyer-counter | Buyer | Counter to farmer's offer |
| AUTO | every hour | System | Check & expire old orders |

---

## 💾 Database Fields Added

### Order
```
expiresAt        DateTime?   // 48h from creation
counterRound     Int         // 0-3
farmerConfirmed  Boolean     // Default: false
buyerConfirmed   Boolean     // Default: false
```

### Listing
```
minimumOrderQuantity  Float?   // Optional constraint
```

---

## 🔑 Core Logic

### Order Creation
- **Input:** listing_id, quantity, [offered_price_per_unit]
- **Validations:** quantity ≤ listing.quantity AND quantity ≥ listing.minimumOrderQuantity
- **Sets:** expiresAt = now + 48 hours, status = PENDING, counterRound = 0
- **Sends SMS** to farmer in Swahili

### Negotiation Rules
1. **Max 3 counter rounds** - counterRound tracks side-by-side negotiations
2. **48-hour expiry** - Auto-reject if no response
3. **Status flow:** PENDING → (negotiations) → ACCEPTED or REJECTED
4. **Final confirmation:** farmerConfirmed or buyerConfirmed flag set

### Auto-Expiry
- Runs on server **startup** and **every hour**
- Finds all PENDING orders where expiresAt < now
- Sets status to REJECTED
- Sends SMS to both buyer and farmer

---

## 📱 All SMS Templates (Swahili)

### Order Created (→ Farmer)
```
Habari [name]! Mnunuzi ameweka agizo la [qty] [unit] ya [crop] yako 
kwa KES [total]. Jibu ndani ya masaa 48. - Mkulima Exchange
```

### Order Accepted (→ Buyer)
```
Habari! Mkulima [name] amekubali agizo lako la [qty] [unit] ya [crop]. 
Tafadhali lipa KES [total] kuendelea. - Mkulima Exchange
```

### Order Rejected (→ Buyer)
```
Pole! Mkulima [name] amekataa agizo lako la [crop]. Sababu: [reason]. 
Tafadhali tafuta orodha nyingine. - Mkulima Exchange
```

### Farmer Counter (→ Buyer)
```
Habari! Mkulima [name] amependekeza bei mpya: KES [price] kwa [unit]. 
Jumla: KES [total]. Raundi [round] ya 3. Jibu kupitia Mkulima Exchange. - Mkulima Exchange
```

### Counter Accepted (→ Farmer)
```
Habari [name]! Mnunuzi amekubali bei yako ya KES [price] kwa [unit]. 
Jumla: KES [total]. Subiri malipo. - Mkulima Exchange
```

### Counter Rejected (→ Farmer)
```
Habari [name]! Mnunuzi amekataa bei yako. 
[if rounds remain: 'Bado una raundi moja ya mazungumzo.'] 
[if done: 'Mazungumzo yameisha.'] - Mkulima Exchange
```

### Buyer Counter (→ Farmer)
```
Habari [name]! Mnunuzi amependekeza bei mpya: KES [price] kwa [unit]. 
Jumla: KES [total]. Raundi [round] ya 3. - Mkulima Exchange
```

### Order Expired (→ Farmer)
```
Agizo la [crop] limeisha muda wake bila jibu. Orodha yako iko hai. - Mkulima Exchange
```

### Order Expired (→ Buyer)
```
Agizo lako la [crop] limeisha muda wake. Tafadhali jaribu tena. - Mkulima Exchange
```

---

## ❌ Error Messages (Swahili)

| Error | Message |
|-------|---------|
| Quantity too high | `Samahani, unahitaji [qty] [unit] lakini mkulima ana [listing.qty] [unit] tu.` |
| Below minimum | `Ununuzi wa chini ni [minimum] [unit] kwa orodha hii.` |
| Expired order | `Agizo hili limeisha muda wake.` |
| Max rounds reached | `Umefika kikomo cha mazungumzo ya bei. Kubali au kataa bei ya sasa.` |

---

## 🔒 Authorization

| Endpoint | Requirement |
|----------|-------------|
| POST /api/orders | Buyer role |
| PATCH /accept | Farmer role + order.farmerId |
| PATCH /reject | Farmer role + order.farmerId |
| PATCH /counter | Farmer role + order.farmerId |
| PATCH /accept-counter | Buyer role + order.buyerId |
| PATCH /reject-counter | Buyer role + order.buyerId |
| PATCH /buyer-counter | Buyer role + order.buyerId |
| GET /orders | Any authenticated user |
| GET /orders/:id | Buyer/Farmer/Admin only |

---

## 🧪 Quick Test Commands

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listing_id":"clq1abc","quantity":50}'
```

### Accept Order
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/accept \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN"
```

### Send Counter
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/counter \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"counter_price_per_unit":180}'
```

---

## 📂 Files Modified

| File | Changes |
|------|---------|
| `/backend/prisma/schema.prisma` | Added Order/Listing fields + indexes |
| `/backend/src/controllers/orderController.js` | All 10 endpoint handlers + checkExpiredOrders |
| `/backend/src/controllers/listingController.js` | Added minimum_order_quantity support |
| `/backend/src/routes/orderRoutes.js` | 9 order endpoints |
| `/backend/src/utils/sms.js` | 9 Swahili SMS functions |
| `/backend/index.js` | Enabled routes + scheduled expiry check |

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mkulima
JWT_SECRET=your_jwt_secret_key
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username
PORT=3000
NODE_ENV=development
```

---

## 🎯 Negotiation Example

```
1. Buyer creates order: qty=50, uses listing price (KES 150/unit)
   → Total: KES 7,500
   → SMS to Farmer ✓

2. Farmer sends counter: KES 180/unit, round=1
   → Total: KES 9,000
   → SMS to Buyer ✓

3. Buyer sends counter: KES 160/unit, round=2
   → Total: KES 8,000
   → SMS to Farmer ✓

4. Farmer accepts counter
   → Status: ACCEPTED
   → farmerConfirmed = true
   → SMS to Buyer ✓
   → Ready for payment
```

---

## 📊 Database Indexes

```prisma
@@index([buyerId])
@@index([farmerId])
@@index([listingId])
@@index([status])
@@index([expiresAt])        // NEW - for efficient expiry queries
```

---

## ✅ Verification Checklist

- [x] Prisma schema updated ✓
- [x] prisma generate run ✓
- [x] Order controller implemented ✓
- [x] All 10 endpoints coded ✓
- [x] SMS utilities with Swahili ✓
- [x] Order routes created ✓
- [x] Listing controller updated ✓
- [x] Main index.js enabled routes ✓
- [x] checkExpiredOrders integrated ✓
- [x] Startup + hourly scheduling ✓
- [x] Error handling complete ✓
- [x] Authorization middleware applied ✓

---

## 🔗 Full Documentation

See **ORDERS_NEGOTIATION_API.md** for complete endpoint documentation with examples.
