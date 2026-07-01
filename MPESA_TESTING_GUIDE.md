# M-Pesa Payment System - Quick Reference & Testing Guide

## Quick Start

### 1. Environment Setup ✓
Environment variables are already in `.env`:
```
MPESA_CONSUMER_KEY=vSwgTnxZGgmUDSRKXGzL3f3X7sgqiGzGj3UCEB3woT0tbdyA
MPESA_CONSUMER_SECRET=TAY4y1Gmf39k1ey5SFEpAbnCzGr6Ieu6GSGqyJX67OxLXSioUNL0ZXptcUxf7FZo
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/callback
```

### 2. Restart Backend
```bash
cd backend
npm install  # if needed
npm start    # or npm run dev
```

### 3. Ensure ngrok is Running
```bash
ngrok http 3000
# Copy the URL and update MPESA_CALLBACK_URL in .env
```

## Endpoint Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payments/initiate/:orderId` | Buyer | Start M-Pesa payment |
| POST | `/api/payments/callback` | None | Daraja webhook |
| PATCH | `/api/payments/confirm-delivery/:orderId` | Buyer/Farmer | Confirm delivery |
| POST | `/api/payments/refund/:orderId` | Admin | Refund payment |
| GET | `/api/payments/:orderId` | All | Get payment status |

## Testing Workflow

### Step 1: Create Order (Order Status = PENDING)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer {buyer_token}" \
  -H "Content-Type: application/json" \
  -d {
    "listingId": "listing_1",
    "quantity": 10
  }
# Response: orderId = "order_abc123"
```

### Step 2: Farmer Accepts Order (Order Status = ACCEPTED)
```bash
curl -X PATCH http://localhost:3000/api/orders/order_abc123/accept \
  -H "Authorization: Bearer {farmer_token}"
# Response: Order status is now ACCEPTED
```

### Step 3: Initiate Payment (Payment Status = PENDING)
```bash
curl -X POST http://localhost:3000/api/payments/initiate/order_abc123 \
  -H "Authorization: Bearer {buyer_token}"
# Response: checkoutRequestId = "ws_CO_DMZ_12345"
```

**What happens:**
- M-Pesa STK Push sent to buyer's phone
- Payment record created with PENDING status
- Frontend can poll checkoutRequestId for status

### Step 4: Simulate M-Pesa Callback (Payment Status = HELD)
When user enters M-Pesa PIN on their phone, Daraja calls our webhook:

```bash
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

**What happens:**
- Payment status → HELD (money in escrow)
- Order status → PAID
- SMS to farmer: "Payment received, send your goods"
- SMS to buyer: "Payment successful"

### Step 5: Farmer Confirms Sending (farmerConfirmed = true)
Farmer confirms they sent the goods:

```bash
curl -X PATCH http://localhost:3000/api/payments/confirm-delivery/order_abc123 \
  -H "Authorization: Bearer {farmer_token}"
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation recorded. Waiting for Buyer confirmation",
  "data": {
    "buyerConfirmed": false,
    "farmerConfirmed": true
  }
}
```

**What happens:**
- SMS to buyer: "Farmer confirmed sending"
- Still waiting for buyer confirmation

### Step 6: Buyer Confirms Receiving (buyerConfirmed = true)
Buyer confirms they received goods:

```bash
curl -X PATCH http://localhost:3000/api/payments/confirm-delivery/order_abc123 \
  -H "Authorization: Bearer {buyer_token}"
```

**Response:**
```json
{
  "success": true,
  "message": "Payment released to farmer",
  "data": {
    "status": "COMPLETED",
    "buyerConfirmed": true,
    "farmerConfirmed": true
  }
}
```

**What happens (ESCROW RELEASED!):**
- Payment status → RELEASED
- Order status → COMPLETED
- B2C: Simulated transfer to farmer
- SMS to farmer: "Money transferred to your M-Pesa"
- SMS to buyer: "Order complete, please leave review"

### Step 7: Check Payment Status Anytime
```bash
curl -X GET http://localhost:3000/api/payments/order_abc123 \
  -H "Authorization: Bearer {buyer_or_farmer_token}"
```

**Response includes:**
- Current payment status
- M-Pesa receipt number
- Both parties' confirmation flags
- Timestamps

## Failure Scenarios

### Scenario 1: Payment Fails (User Cancels)
```bash
# Simulate failed M-Pesa callback
curl -X POST http://localhost:3000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "stkCallback": {
      "MerchantRequestID": "16917-1234567-1",
      "CheckoutRequestID": "ws_CO_DMZ_12345",
      "ResultCode": 1001,
      "ResultDesc": "User cancelled the transaction"
    }
  }'
```

**What happens:**
- Payment status → REFUNDED
- Order status → ACCEPTED (buyer can retry)
- SMS to buyer: "Payment failed, try again"

### Scenario 2: Admin Refund
```bash
curl -X POST http://localhost:3000/api/payments/refund/order_abc123 \
  -H "Authorization: Bearer {admin_token}"
```

**What happens:**
- Payment status → REFUNDED
- Order status → DISPUTED
- SMS to buyer: "Refund processing in 3-5 days"
- SMS to farmer: "Order disputed, we'll contact you"

## SMS Messages

All messages are in **Swahili** and automatically sent:

### After Payment Success
**To Farmer:**
```
Habari [farmerName]! Mnunuzi amelipa KES [amount] 
kwa [cropName] yako. Pesa imehifadhiwa salama. 
Tuma mazao ili kupokea malipo yako. - Mkulima Exchange
```

**To Buyer:**
```
Malipo ya KES [amount] yamefanikiwa. 
Nambari ya risiti: [MpesaReceiptNumber]. 
Subiri mkulima atume mazao yako. - Mkulima Exchange
```

### After Farmer Confirms
**To Buyer:**
```
Mkulima amethibitisha kutuma mazao. - Mkulima Exchange
```

### After Buyer Confirms
**To Farmer:**
```
Mnunuzi amethibitisha kupokea mazao. 
Thibitisha wewe pia ili kupokea malipo yako. 
- Mkulima Exchange
```

### After Both Confirm (Payment Released!)
**To Farmer:**
```
Hongera [farmerName]! KES [amount] imetumwa 
kwenye M-Pesa yako [mpesaNumber]. 
Asante kwa kutumia Mkulima Exchange! - Mkulima Exchange
```

**To Buyer:**
```
Manunuzi yamekamilika. Asante kwa kutumia 
Mkulima Exchange! Tafadhali acha ukaguzi kwa mkulima. 
- Mkulima Exchange
```

## Debugging

### Check Payment Status in Database
```bash
# Connect to PostgreSQL
psql -U postgres -d mkulima_db

# Query payments
SELECT id, status, amount, "buyerConfirmed", "farmerConfirmed" 
FROM "Payment" ORDER BY "createdAt" DESC;
```

### View Backend Logs
The backend logs every step:
```
💳 [PAYMENT INITIATION] Order: order_abc123, Buyer: buyer_1
✓ Payment record created: payment_xyz, Status: PENDING
📤 Sending STK Push request to Daraja...
✓ STK Push initiated successfully

📬 [DARAJA CALLBACK RECEIVED]
✓ Payment updated to HELD status
✓ Order status updated to PAID
📩 SMS sent to farmer and buyer

✅ [DELIVERY CONFIRMATION] Order: order_abc123
✓ Buyer confirmation recorded
🎉 [ESCROW RELEASE] Both parties confirmed!
✓ B2C transfer simulated
✓ Payment status updated to RELEASED
```

### Common Issues

**Issue:** ngrok URL not working
- **Solution:** Restart ngrok, update MPESA_CALLBACK_URL in .env

**Issue:** Daraja OAuth fails
- **Solution:** Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env

**Issue:** SMS not sent
- **Solution:** Check AFRICASTALKING_API_KEY in .env
- Note: Payment still processes, SMS is non-critical

**Issue:** "Order status must be ACCEPTED"
- **Solution:** Farmer hasn't accepted the order yet

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/utils/daraja.js` | Daraja API integration |
| `backend/src/utils/sms.js` | SMS notifications |
| `backend/src/controllers/paymentController.js` | Payment logic (5 endpoints) |
| `backend/src/routes/paymentRoutes.js` | Route definitions |
| `backend/prisma/schema.prisma` | Database schema |

## Payment State Diagram

```
Order Flow:
  PENDING → ACCEPTED → PAID → COMPLETED
                         ↓
                      DISPUTED (if refunded)

Payment Flow:
  PENDING → HELD → RELEASED
    ↓
    REFUNDED

Conditions:
- Payment can only go PENDING → HELD if order is ACCEPTED
- Payment only goes HELD → RELEASED if buyerConfirmed AND farmerConfirmed
- Payment goes to REFUNDED if user cancels or admin initiates refund
```

## What's Next?

For production deployment:
1. **Real B2C Payouts:** Implement actual Daraja B2C (currently simulated)
2. **Webhook Signature Validation:** Verify Daraja webhook authenticity
3. **Transaction Reconciliation:** Daily sync with Daraja
4. **Retry Logic:** Handle missed callbacks
5. **Rate Limiting:** Prevent abuse
6. **Audit Trail:** Log all payment state changes

## Support

Refer to:
- Full documentation: `MPESA_ESCROW_SYSTEM.md`
- Daraja API: https://developer.safaricom.co.ke
- Africa's Talking: https://africastalking.com/sms
