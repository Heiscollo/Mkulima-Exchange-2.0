# M-Pesa Escrow Payment System - Mkulima Exchange

**Academic Documentation - University Final Year Project**

## Overview

This document describes the complete M-Pesa payment system implementation using Safaricom Daraja API for Mkulima Exchange. The system implements an **ESCROW model** where money is held safely after payment and only released to the farmer after both parties confirm successful delivery.

## Architecture

### Payment Lifecycle (ESCROW FLOW)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ORDER ACCEPTED (order.status = ACCEPTED)                 │
│    → Buyer and Farmer have agreed on terms                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BUYER INITIATES PAYMENT (POST /api/payments/initiate)    │
│    → Payment.status = PENDING                               │
│    → M-Pesa STK Push sent to buyer's phone                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BUYER ENTERS M-PESA PIN                                  │
│    → Safaricom processes transaction                        │
│    → Daraja calls /api/payments/callback webhook            │
└─────────────────────────────────────────────────────────────┘
                    ↙ Success      ↘ Failure
    ┌──────────────────────┐  ┌──────────────────────┐
    │ Payment.status=HELD  │  │ Payment.status=      │
    │ Order.status=PAID    │  │   REFUNDED           │
    │ Order.status=ACCEPTED│  │ (Buyer can retry)    │
    │ SMS to farmer: "$$   │  │ SMS to buyer:        │
    │   received, send     │  │   "Failed, try again"│
    │   your goods"        │  │                      │
    └──────────────────────┘  │                      │
            ↓                 └──────────────────────┘
    ┌──────────────────────────────────────────────┐
    │ 4. FARMER SENDS GOODS                        │
    │    (Off-chain delivery)                      │
    │    ↓ Farmer confirms sent                    │
    │ 5. FARMER CONFIRMS (PATCH /confirm-delivery)│
    │    → Payment.farmerConfirmed = true          │
    │    → SMS to buyer: "Farmer confirmed sending"│
    └──────────────────────────────────────────────┘
                    ↓
    ┌──────────────────────────────────────────────┐
    │ 6. BUYER RECEIVES & CONFIRMS                 │
    │    (Buyer inspects goods)                    │
    │    ↓ Buyer confirms received                 │
    │ 7. BUYER CONFIRMS (PATCH /confirm-delivery) │
    │    → Payment.buyerConfirmed = true           │
    │    → SMS to farmer: "Buyer confirmed received"
    └──────────────────────────────────────────────┘
                    ↓
    ┌──────────────────────────────────────────────┐
    │ 8. BOTH CONFIRMED - RELEASE ESCROW!          │
    │    → Payment.status = RELEASED               │
    │    → Order.status = COMPLETED                │
    │    → B2C: Transfer to farmer's M-Pesa        │
    │    → SMS confirmations to both               │
    │    → Order can be reviewed                   │
    └──────────────────────────────────────────────┘
```

## Database Schema Updates

### Payment Model (Prisma)

```prisma
model Payment {
  id                    String        @id @default(cuid())
  order                 Order         @relation(fields: [orderId], references: [id])
  orderId               String        @unique
  
  // M-Pesa transaction tracking
  mpesaTransactionId    String?       @unique
  amount                Float
  status                PaymentStatus @default(PENDING)
  
  // Payer and receiver information
  payerPhone            String        // Buyer's M-Pesa number
  farmerPhone           String?       // Farmer's M-Pesa number
  
  // Escrow confirmation flags - CRITICAL FOR ESCROW RELEASE
  buyerConfirmed        Boolean       @default(false)    // Buyer received goods
  farmerConfirmed       Boolean       @default(false)    // Farmer sent goods
  
  paidAt                DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  @@index([status])
  @@index([mpesaTransactionId])
}

enum PaymentStatus {
  PENDING    // Payment initiated, awaiting M-Pesa PIN entry
  HELD       // Payment successful, money in escrow
  RELEASED   // Both parties confirmed, money transferred to farmer
  REFUNDED   // Payment refunded (dispute or failed)
}
```

## API Endpoints

### 1. POST /api/payments/initiate/:orderId

**Authentication:** Required (Buyer only)

**Purpose:** Buyer initiates M-Pesa payment for an order

**Flow:**
1. Verify order exists and belongs to buyer
2. Verify order status is ACCEPTED
3. Get Daraja OAuth token using credentials from .env
4. Generate STK Push password (Base64 encoded)
5. Send STK Push request to buyer's phone
6. Create Payment record with PENDING status

**Request:**
```json
{
  "orderId": "order_123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment initiated. Please enter your M-Pesa PIN",
  "data": {
    "checkoutRequestId": "ws_CO_DMZ_12345",
    "merchantRequestId": "16917-1234567-1",
    "paymentId": "payment_abc123",
    "amount": 5000,
    "status": "PENDING"
  }
}
```

**Error Handling:**
- `404 Order not found` - Invalid order ID
- `403 This order does not belong to you` - Order belongs to different buyer
- `400 Order status must be ACCEPTED` - Farmer hasn't accepted yet
- `400 Payment initiation failed: Invalid phone number` - Buyer's phone invalid
- `400 Payment initiation failed: [Daraja error]` - OAuth or API failure

---

### 2. POST /api/payments/callback

**Authentication:** None (Public webhook)

**Purpose:** Daraja webhook endpoint - receives M-Pesa transaction response

**Who calls it:** Safaricom Daraja API (automatic)

**Request Body (from Daraja):**
```json
{
  "stkCallback": {
    "MerchantRequestID": "16917-1234567-1",
    "CheckoutRequestID": "ws_CO_DMZ_12345",
    "ResultCode": 0,
    "ResultDesc": "The service request has been processed successfully.",
    "CallbackMetadata": {
      "Item": [
        {"Name": "Amount", "Value": 5000},
        {"Name": "MpesaReceiptNumber", "Value": "LHG31H500G6"},
        {"Name": "TransactionDate", "Value": 20240602143500},
        {"Name": "PhoneNumber", "Value": 254712345678}
      ]
    }
  }
}
```

**Processing:**
- **On Success (ResultCode = 0):**
  - Extract M-Pesa receipt number from metadata
  - Update Payment: status → HELD, mpesaTransactionId
  - Update Order: status → PAID
  - SMS to farmer: "Payment received, send your goods"
  - SMS to buyer: "Payment successful, waiting for delivery"

- **On Failure (ResultCode ≠ 0):**
  - Update Payment: status → REFUNDED
  - Update Order: status → ACCEPTED (buyer can retry)
  - SMS to buyer: "Payment failed, try again"

**Response:**
Always returns 200 to acknowledge to Daraja:
```json
{
  "success": true,
  "message": "Callback processed successfully"
}
```

---

### 3. PATCH /api/payments/confirm-delivery/:orderId

**Authentication:** Required (Buyer or Farmer)

**Purpose:** Confirm delivery of goods - CRITICAL for escrow release

**IMPORTANT ESCROW LOGIC:**
- Buyer confirms: "I received the goods" → `buyerConfirmed = true`
- Farmer confirms: "I sent the goods" → `farmerConfirmed = true`
- **When BOTH true:** Payment is RELEASED, order is COMPLETED

**Request:**
```
PATCH /api/payments/confirm-delivery/order_123
Authorization: Bearer {token}
```

**Response (Waiting for other party):**
```json
{
  "success": true,
  "message": "Confirmation recorded. Waiting for Farmer confirmation",
  "data": {
    "orderId": "order_123",
    "status": "PAID",
    "buyerConfirmed": true,
    "farmerConfirmed": false,
    "message": "Waiting for Farmer to confirm delivery"
  }
}
```

**Response (Both confirmed - ESCROW RELEASED!):**
```json
{
  "success": true,
  "message": "Payment released to farmer",
  "data": {
    "orderId": "order_123",
    "status": "COMPLETED",
    "message": "Both parties confirmed. Payment has been released to the farmer.",
    "buyerConfirmed": true,
    "farmerConfirmed": true
  }
}
```

**On Escrow Release:**
1. Payment.status → RELEASED
2. Order.status → COMPLETED
3. B2C: Transfer to farmer (simulated for now)
4. SMS to farmer: "Money transferred to your M-Pesa"
5. SMS to buyer: "Thank you for using Mkulima Exchange"

---

### 4. POST /api/payments/refund/:orderId

**Authentication:** Required (Admin only)

**Purpose:** Admin refunds a disputed payment

**Flow:**
1. Verify user is admin
2. Update Payment: status → REFUNDED
3. Update Order: status → DISPUTED
4. SMS to buyer: "Refund will process in 3-5 days"
5. SMS to farmer: "Order disputed, we'll contact you"

**Request:**
```
POST /api/payments/refund/order_123
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "orderId": "order_123",
    "paymentId": "payment_abc123",
    "amount": 5000,
    "status": "REFUNDED"
  }
}
```

---

### 5. GET /api/payments/:orderId

**Authentication:** Required

**Purpose:** Get payment status and confirmation flags

**Who can access:**
- Buyer on the order
- Farmer on the order
- Admin users

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved",
  "data": {
    "id": "payment_abc123",
    "orderId": "order_123",
    "amount": 5000,
    "status": "HELD",
    "mpesaTransactionId": "LHG31H500G6",
    "paidAt": "2024-06-02T14:35:00Z",
    "createdAt": "2024-06-02T14:30:00Z",
    "updatedAt": "2024-06-02T14:35:00Z",
    "buyerConfirmed": false,
    "farmerConfirmed": false,
    "orderStatus": "PAID",
    "buyer": {
      "id": "buyer_1",
      "name": "John Buyer",
      "mpesaNumber": "+254712345678"
    },
    "farmer": {
      "id": "farmer_1",
      "name": "Jane Farmer",
      "mpesaNumber": "+254701234567"
    }
  }
}
```

## Environment Variables Required

```env
# Safaricom Daraja M-Pesa Credentials
MPESA_CONSUMER_KEY=vSwgTnxZGgmUDSRKXGzL3f3X7sgqiGzGj3UCEB3woT0tbdyA
MPESA_CONSUMER_SECRET=TAY4y1Gmf39k1ey5SFEpAbnCzGr6Ieu6GSGqyJX67OxLXSioUNL0ZXptcUxf7FZo
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/callback

# Africa's Talking SMS
AFRICASTALKING_API_KEY=atsk_2ed3c265ab0c1e289437cfdc879e8e106f5d13bfaa586a3046120fb019ce45c85a7e685e
AFRICASTALKING_USERNAME=sandbox
```

## Error Handling

### Daraja-Specific Errors

#### Invalid Credentials (401)
```
Error: Invalid M-Pesa credentials. Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET
```
**Solution:** Verify credentials in .env file

#### Invalid Phone Number Format
```
Error: Phone number must be in +254XXXXXXXXX format
```
**Solution:** Ensure phone numbers are stored correctly in User profile

#### Insufficient Funds (Sandbox Simulation)
```
Daraja ResultCode: 1001
ResultDesc: Insufficient funds
```
**Solution:** Add credit to test M-Pesa account

#### Timeout Error
```
Error: Daraja API timeout. Check internet connection.
```
**Solution:** Verify ngrok tunnel is running and MPESA_CALLBACK_URL is correct

### SMS Errors

If SMS fails:
- Payment still processes (SMS is non-critical)
- Error logged but doesn't block payment
- User can still see status in dashboard

## Testing Guide

### 1. Test Payment Initiation

```bash
# Initiate payment
curl -X POST http://localhost:3000/api/payments/initiate/order_123 \
  -H "Authorization: Bearer {buyer_token}" \
  -H "Content-Type: application/json"
```

**Expected:** Returns CheckoutRequestID and directs buyer to enter M-Pesa PIN

### 2. Simulate M-Pesa Callback

```bash
# Send simulated callback
curl -X POST http://localhost:3000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "stkCallback": {
      "MerchantRequestID": "16917-1234567-1",
      "CheckoutRequestID": "ws_CO_DMZ_12345",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 5000},
          {"Name": "MpesaReceiptNumber", "Value": "LHG31H500G6"},
          {"Name": "TransactionDate", "Value": 20240602143500},
          {"Name": "PhoneNumber", "Value": 254712345678}
        ]
      }
    }
  }'
```

**Expected:** Payment status changes to HELD, Order to PAID

### 3. Test Delivery Confirmation

```bash
# Farmer confirms
curl -X PATCH http://localhost:3000/api/payments/confirm-delivery/order_123 \
  -H "Authorization: Bearer {farmer_token}" \
  -H "Content-Type: application/json"

# Then buyer confirms
curl -X PATCH http://localhost:3000/api/payments/confirm-delivery/order_123 \
  -H "Authorization: Bearer {buyer_token}" \
  -H "Content-Type: application/json"
```

**Expected:** After both confirmations, payment is RELEASED and order is COMPLETED

### 4. Test Refund

```bash
curl -X POST http://localhost:3000/api/payments/refund/order_123 \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

**Expected:** Payment status → REFUNDED, Order → DISPUTED

## Implementation Notes for Go-Live

### 1. Production B2C Payment
Currently, farmer payout is simulated. For go-live:
```javascript
// In confirmDelivery endpoint, replace simulation with:
const b2cResult = await axios.post(B2C_URL, {
  TransactionType: 'BusinessToCustomer',
  CommandID: 'SalaryPayment',
  Amount: order.totalPrice,
  PartyA: MPESA_SHORTCODE,
  PartyB: order.farmer.mpesaNumber,
  Remarks: `Payment for ${order.listing.cropName}`,
  QueueTimeOutURL: MPESA_CALLBACK_URL,
  ResultURL: MPESA_CALLBACK_URL,
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Webhook Signature Validation
Add signature verification in callback:
```javascript
const signature = req.headers['x-mpesa-signature'];
const verified = verifySignature(body, signature);
```

### 3. Payment Retry Logic
Implement retry mechanism for failed callbacks:
```javascript
if (!callbackProcessed) {
  scheduleRetry(callbackData, delayMs);
}
```

### 4. Transaction Reconciliation
Add daily reconciliation with Daraja to catch missed callbacks

## Academic Key Concepts

### Escrow System
- **Safety:** Money held by trusted third party (Safaricom)
- **Fairness:** Released only when both parties confirm
- **Dispute Resolution:** Can be refunded if issues arise
- **Trust Building:** Reduces fraud and gives confidence

### Webhook Security
- Idempotent processing (handles duplicate callbacks)
- IP whitelisting by Daraja
- Future: Signature verification
- Always return 200 to Daraja (don't retry)

### State Machine
Payment states form a directed acyclic graph:
```
PENDING → HELD → RELEASED
  ↓          ↓
  └→ REFUNDED
```

### Error Recovery
- Transient errors (network): Automatic retry
- Permanent errors (invalid phone): User notification
- Processing errors: Logged for manual review

## Files Modified/Created

1. **backend/prisma/schema.prisma**
   - Added fields to Payment model: `farmerPhone`, `buyerConfirmed`, `farmerConfirmed`

2. **backend/src/utils/daraja.js**
   - `getDarajaToken()` - OAuth token generation
   - `generateStkPassword()` - Password encoding
   - `initiateStkPush()` - STK push request
   - `releasePaymentB2C()` - Farmer payout (simulated)
   - `parseDarajaCallback()` - Webhook parsing

3. **backend/src/utils/sms.js**
   - Payment-specific SMS functions for escrow flow
   - Swahili SMS templates for all stages

4. **backend/src/controllers/paymentController.js**
   - `initiatePayment()` - Endpoint 1
   - `handleDarajaCallback()` - Endpoint 2
   - `confirmDelivery()` - Endpoint 3
   - `refundPayment()` - Endpoint 4
   - `getPaymentStatus()` - Endpoint 5

5. **backend/src/routes/paymentRoutes.js**
   - Wired all 5 endpoints with proper middleware

6. **backend/index.js**
   - Imported and mounted payment routes

## Conclusion

The M-Pesa escrow payment system provides:
- ✅ Secure payment handling via Safaricom Daraja
- ✅ Trust through 2-party confirmation before release
- ✅ SMS notifications in Swahili for farmer education
- ✅ Comprehensive error handling for reliability
- ✅ Academic documentation for university project requirements
- ✅ Extensible for production B2C payouts

The system handles the complete order lifecycle from payment initiation through successful delivery confirmation and farmer payout.
