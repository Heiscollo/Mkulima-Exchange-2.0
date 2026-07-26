# Mkulima Exchange - Orders & Negotiation System API

## Overview
Complete orders and price negotiation system with SMS notifications in Swahili. Supports multi-round price negotiation between farmers and buyers with automatic order expiry after 48 hours.

## Database Schema Updates

### Listing Model - New Field
```prisma
minimumOrderQuantity  Float?    // Minimum quantity buyer must order
```

### Order Model - New Fields
```prisma
expiresAt             DateTime?  // Order expiration time (48 hours from creation)
counterRound          Int        // Current negotiation round (0-3)
farmerConfirmed       Boolean    // Farmer has accepted the final price
buyerConfirmed        Boolean    // Buyer has accepted the final price
```

## API Endpoints

### 1. POST /api/orders
**Create an Order (Buyers only)**

Creates a new order with optional price offer and sets 48-hour expiry.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "listing_id": "listing-uuid",
  "quantity": 50,
  "offered_price_per_unit": 150  // Optional - defaults to listing price
}
```

**Validations:**
- Quantity cannot exceed listing quantity
  - Error: "Samahani, unahitaji [quantity] KG lakini mkulima ana [listing.quantity] KG tu."
- Quantity must meet minimum order quantity if set
  - Error: "Ununuzi wa chini ni [minimumOrderQuantity] [unit] kwa orodha hii."
- Buyer role required

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "listingId": "listing-uuid",
    "buyerId": "buyer-uuid",
    "farmerId": "farmer-uuid",
    "quantity": 50,
    "totalPrice": 7500,
    "offeredPrice": 150,
    "counterRound": 0,
    "expiresAt": "2026-06-03T12:34:56.000Z",
    "farmerConfirmed": false,
    "buyerConfirmed": false,
    "status": "PENDING",
    "isExpired": false
  }
}
```

**SMS Sent to Farmer:**
```
Habari [farmerName]! Mnunuzi ameweka agizo la [quantity] [unit] ya [cropName] yako 
kwa KES [totalPrice]. Jibu ndani ya masaa 48. - Mkulima Exchange
```

---

### 2. GET /api/orders
**List Orders (Authenticated)**

Buyers see their orders, farmers see orders on their listings. Supports status filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): PENDING, ACCEPTED, REJECTED, PAID, DELIVERED, COMPLETED, DISPUTED

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "order-uuid",
      "quantity": 50,
      "totalPrice": 7500,
      "counterRound": 1,
      "expiresAt": "2026-06-03T12:34:56.000Z",
      "status": "PENDING",
      "isExpired": false,
      "listing": {
        "id": "listing-uuid",
        "cropName": "Tomatoes",
        "unit": "KG",
        "farmer": { "id": "...", "name": "...", "phone": "..." }
      },
      "buyer": { "id": "...", "name": "...", "phone": "..." },
      "farmer": { "id": "...", "name": "...", "phone": "..." }
    }
  ]
}
```

---

### 3. GET /api/orders/:id
**Get Order Details**

Full order details with all relationships and computed isExpired field.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "order-uuid",
    "quantity": 50,
    "totalPrice": 7500,
    "offeredPrice": 150,
    "counterRound": 2,
    "expiresAt": "2026-06-03T12:34:56.000Z",
    "farmerConfirmed": true,
    "buyerConfirmed": false,
    "status": "PENDING",
    "isExpired": false,
    "listing": { /* full listing */ },
    "buyer": { /* full buyer */ },
    "farmer": { /* full farmer */ },
    "payment": { /* payment info if exists */ },
    "review": { /* review if exists */ }
  }
}
```

---

### 4. PATCH /api/orders/:id/accept
**Accept Order (Farmer only)**

Farmer accepts the buyer's offer. Sets status to ACCEPTED and farmerConfirmed to true.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Validations:**
- Farmer role required
- Order must not be expired
  - Error: "Agizo hili limeisha muda wake."

**Response (200):**
```json
{
  "success": true,
  "message": "Order accepted successfully",
  "data": { /* updated order */ }
}
```

**SMS Sent to Buyer:**
```
Habari! Mkulima [farmerName] amekubali agizo lako la [quantity] [unit] ya [cropName]. 
Tafadhali lipa KES [totalPrice] kuendelea. - Mkulima Exchange
```

---

### 5. PATCH /api/orders/:id/reject
**Reject Order (Farmer only)**

Farmer rejects the order with optional reason.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Out of stock"  // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order rejected successfully",
  "data": { /* updated order with status: REJECTED */ }
}
```

**SMS Sent to Buyer:**
```
Pole! Mkulima [farmerName] amekataa agizo lako la [cropName]. 
Sababu: [reason]. Tafadhali tafuta orodha nyingine. - Mkulima Exchange
```

---

### 6. PATCH /api/orders/:id/counter
**Send Counter Offer (Farmer only)**

Farmer proposes a new price. Max 3 rounds allowed.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "counter_price_per_unit": 180
}
```

**Validations:**
- Farmer role required
- Order must not be expired
- counterRound must be < 3
  - Error: "Umefika kikomo cha mazungumzo ya bei. Kubali au kataa bei ya sasa."

**Response (200):**
```json
{
  "success": true,
  "message": "Counter offer sent successfully",
  "data": {
    "id": "order-uuid",
    "offeredPrice": 180,
    "totalPrice": 9000,
    "counterRound": 1,
    "status": "PENDING",
    /* rest of order */
  }
}
```

**SMS Sent to Buyer:**
```
Habari! Mkulima [farmerName] amependekeza bei mpya: KES [counterPrice] kwa [unit]. 
Jumla: KES [totalPrice]. Raundi [counterRound] ya 3. Jibu kupitia Mkulima Exchange. 
- Mkulima Exchange
```

---

### 7. PATCH /api/orders/:id/accept-counter
**Accept Counter Offer (Buyer only)**

Buyer accepts the farmer's counter price. Sets status to ACCEPTED and buyerConfirmed to true.

**Headers:**
```
Authorization: Bearer <token>
```

**Validations:**
- Buyer role required
- Order must not be expired

**Response (200):**
```json
{
  "success": true,
  "message": "Counter offer accepted successfully",
  "data": {
    "id": "order-uuid",
    "status": "ACCEPTED",
    "buyerConfirmed": true,
    /* rest of order */
  }
}
```

**SMS Sent to Farmer:**
```
Habari [farmerName]! Mnunuzi amekubali bei yako ya KES [counterPrice] kwa [unit]. 
Jumla: KES [totalPrice]. Subiri malipo. - Mkulima Exchange
```

---

### 8. PATCH /api/orders/:id/reject-counter
**Reject Counter Offer (Buyer only)**

Buyer rejects farmer's counter. If rounds remain (< 3), returns to PENDING for buyer response. Otherwise, sets to REJECTED.

**Headers:**
```
Authorization: Bearer <token>
```

**Validations:**
- Buyer role required

**Response (200):**
```json
{
  "success": true,
  "message": "Counter offer rejected successfully",
  "data": {
    "id": "order-uuid",
    "status": "PENDING",  // or REJECTED if round = 3
    "counterRound": 2,
    /* rest of order */
  }
}
```

**SMS Sent to Farmer:**
```
Habari [farmerName]! Mnunuzi amekataa bei yako. 
[if rounds remain: 'Bado una raundi moja ya mazungumzo.']
[if no rounds: 'Mazungumzo yameisha.'] - Mkulima Exchange
```

---

### 9. PATCH /api/orders/:id/buyer-counter
**Send Counter Offer (Buyer only)**

Buyer sends counter price after rejecting farmer's offer. Only allowed if counterRound < 3.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "offered_price_per_unit": 160
}
```

**Validations:**
- Buyer role required
- counterRound must be < 3
  - Error: "Umefika kikomo cha mazungumzo ya bei."

**Response (200):**
```json
{
  "success": true,
  "message": "Counter offer sent successfully",
  "data": {
    "id": "order-uuid",
    "offeredPrice": 160,
    "totalPrice": 8000,
    "counterRound": 2,
    "status": "PENDING",
    /* rest of order */
  }
}
```

**SMS Sent to Farmer:**
```
Habari [farmerName]! Mnunuzi amependekeza bei mpya: KES [offeredPrice] kwa [unit]. 
Jumla: KES [totalPrice]. Raundi [counterRound] ya 3. - Mkulima Exchange
```

---

## Automatic Order Expiry System

### checkExpiredOrders() Function
Runs automatically on server startup and every hour via setInterval.

**Behavior:**
- Finds all PENDING orders where expiresAt < current time
- Sets them to REJECTED
- Sends SMS notifications to both farmer and buyer

**SMS to Farmer:**
```
Agizo la [cropName] limeisha muda wake bila jibu. Orodha yako iko hai. 
- Mkulima Exchange
```

**SMS to Buyer:**
```
Agizo lako la [cropName] limeisha muda wake. Tafadhali jaribu tena. 
- Mkulima Exchange
```

---

## Order Status Lifecycle

```
PENDING
├─ (Farmer accepts) → ACCEPTED → PAID → DELIVERED → COMPLETED
├─ (Farmer counter) → PENDING → ...
├─ (Farmer rejects) → REJECTED
├─ (Expires after 48h) → REJECTED
└─ (Buyer counter) → PENDING → ...
```

**Counter Negotiation Flow:**
1. Buyer creates order (quantity can be custom, price optional)
2. Farmer can: accept, reject, or counter
3. If farmer counters: buyer can accept or reject
4. If buyer rejects (and rounds < 3): buyer can counter
5. If farmer counters (and rounds < 3): buyer can accept or reject
6. Max 3 rounds per side
7. After round 3: final acceptance or rejection only

---

## Listing Updates

### POST /api/listings - New Field

**Body:**
```json
{
  "crop_name": "Tomatoes",
  "crop_category": "VEGETABLES",
  "quantity": 100,
  "unit": "KG",
  "price_per_unit": 150,
  "minimum_order_quantity": 10,  // NEW - Optional
  "county": "NAIROBI",
  "description": "Fresh tomatoes",
  "available_date": "2026-06-10T00:00:00Z"
}
```

**Validation:**
- If provided, minimum_order_quantity must be > 0 and <= quantity
  - Error: "Minimum order quantity must be less than or equal to listing quantity"

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Quantity exceeds available",
  "error": "Samahani, unahitaji 100 KG lakini mkulima ana 50 KG tu."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Only buyers and farmers can view orders"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

---

## Authentication

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token should contain:
- `userId`: User's unique identifier
- `role`: "BUYER" or "FARMER"

---

## SMS Notifications

All SMS messages are sent in **Swahili** using Africa's Talking API.

Environment variables required:
```
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username
```

---

## Testing the System

### Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <buyer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "clq1abc123xyz",
    "quantity": 50,
    "offered_price_per_unit": 150
  }'
```

### Accept Order (Farmer)
```bash
curl -X PATCH http://localhost:3000/api/orders/<order_id>/accept \
  -H "Authorization: Bearer <farmer_token>"
```

### Send Counter (Farmer)
```bash
curl -X PATCH http://localhost:3000/api/orders/<order_id>/counter \
  -H "Authorization: Bearer <farmer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "counter_price_per_unit": 180
  }'
```

### Accept Counter (Buyer)
```bash
curl -X PATCH http://localhost:3000/api/orders/<order_id>/accept-counter \
  -H "Authorization: Bearer <buyer_token>"
```

---

## Implementation Files

- **Database:** `/backend/prisma/schema.prisma`
- **Controllers:** `/backend/src/controllers/orderController.js`
- **Routes:** `/backend/src/routes/orderRoutes.js`
- **SMS Utils:** `/backend/src/utils/sms.js`
- **Main Server:** `/backend/index.js`
- **Listing Controller:** `/backend/src/controllers/listingController.js`
