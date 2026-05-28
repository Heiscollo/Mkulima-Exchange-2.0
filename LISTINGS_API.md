# Listings API Documentation

## Overview

The Listings API enables farmers to create and manage agricultural product listings, and allows buyers to search and view available listings. All endpoints support comprehensive input validation and proper authentication/authorization.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## API Endpoints

### 1. Create Listing (POST /api/listings)

**Authentication:** Required (Farmers only)

**Request Type:** `multipart/form-data`

**Request Body:**
```
crop_name (required): string (2-100 chars) - Name of the crop
crop_category (required): enum - Category of the crop
  - CEREALS_AND_GRAINS
  - LEGUMES_AND_PULSES
  - VEGETABLES
  - FRUITS
  - ROOT_CROPS_AND_TUBERS
  - CASH_CROPS
  - HERBS_AND_SPICES
  - NUTS_AND_SEEDS
  - DAIRY_AND_LIVESTOCK_PRODUCTS
  - FISH_AND_SEAFOOD
  - TREE_CROPS_AND_OTHERS
quantity (required): number (positive) - Amount being sold
unit (required): enum - Unit of measurement
  - KG
  - BAG
  - CRATE
  - TONNE
  - LITRE
  - BUNCH
  - SACK
price_per_unit (required): number (positive) - Price per unit in KES
county (required): string - County name
description (optional): string (max 1000 chars) - Detailed product description
available_date (required): date (ISO 8601) - When product is available
images (optional): file[] (max 5 files, 10MB each) - Product images
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Authorization: Bearer <token>" \
  -F "crop_name=Maize" \
  -F "crop_category=CEREALS_AND_GRAINS" \
  -F "quantity=100" \
  -F "unit=BAG" \
  -F "price_per_unit=3500" \
  -F "county=Nakuru" \
  -F "description=High quality maize from my farm" \
  -F "available_date=2024-06-01" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "listing": {
    "id": "cljy8x9q90000",
    "farmerId": "user123",
    "cropName": "Maize",
    "cropCategory": "CEREALS_AND_GRAINS",
    "quantity": 100,
    "unit": "BAG",
    "pricePerUnit": 3500,
    "county": "Nakuru",
    "description": "High quality maize from my farm",
    "availableDate": "2024-06-01T00:00:00.000Z",
    "images": [
      "https://res.cloudinary.com/...",
      "https://res.cloudinary.com/..."
    ],
    "status": "ACTIVE",
    "createdAt": "2024-05-28T10:30:00.000Z",
    "updatedAt": "2024-05-28T10:30:00.000Z",
    "farmer": {
      "id": "user123",
      "name": "John Farmer",
      "phone": "+254712345678",
      "county": "Nakuru"
    }
  }
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "location": "body",
      "msg": "Quantity must be a positive number",
      "param": "quantity"
    }
  ]
}
```

---

### 2. Get All Listings (GET /api/listings)

**Authentication:** Not required (Public)

**Query Parameters:**
```
crop_name (optional): string - Search by crop name (case-insensitive)
crop_category (optional): enum - Filter by crop category
county (optional): string - Filter by county
min_price (optional): number - Minimum price filter
max_price (optional): number - Maximum price filter
page (optional): integer (default: 1) - Page number for pagination
limit (optional): integer (default: 20, max: 100) - Results per page
```

**Example Request:**
```bash
curl "http://localhost:3000/api/listings?crop_name=Maize&county=Nakuru&page=1&limit=20"
```

**Success Response (200):**
```json
{
  "success": true,
  "listings": [
    {
      "id": "cljy8x9q90000",
      "farmerId": "user123",
      "cropName": "Maize",
      "cropCategory": "CEREALS_AND_GRAINS",
      "quantity": 100,
      "unit": "BAG",
      "pricePerUnit": 3500,
      "county": "Nakuru",
      "description": "High quality maize from my farm",
      "images": ["https://res.cloudinary.com/..."],
      "status": "ACTIVE",
      "createdAt": "2024-05-28T10:30:00.000Z",
      "farmer": {
        "id": "user123",
        "name": "John Farmer",
        "phone": "+254712345678",
        "county": "Nakuru"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### 3. Get Single Listing (GET /api/listings/:id)

**Authentication:** Not required (Public)

**URL Parameters:**
```
id (required): string - Listing ID
```

**Example Request:**
```bash
curl http://localhost:3000/api/listings/cljy8x9q90000
```

**Success Response (200):**
```json
{
  "success": true,
  "listing": {
    "id": "cljy8x9q90000",
    "farmerId": "user123",
    "cropName": "Maize",
    "cropCategory": "CEREALS_AND_GRAINS",
    "quantity": 100,
    "unit": "BAG",
    "pricePerUnit": 3500,
    "county": "Nakuru",
    "description": "High quality maize from my farm",
    "availableDate": "2024-06-01T00:00:00.000Z",
    "images": ["https://res.cloudinary.com/..."],
    "status": "ACTIVE",
    "createdAt": "2024-05-28T10:30:00.000Z",
    "updatedAt": "2024-05-28T10:30:00.000Z",
    "farmer": {
      "id": "user123",
      "name": "John Farmer",
      "phone": "+254712345678",
      "county": "Nakuru",
      "farmerProfile": {
        "farmSizeAcres": 50,
        "cropsGrown": ["MAIZE", "BEANS"]
      }
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "Listing not found"
}
```

---

### 4. Update Listing (PUT /api/listings/:id)

**Authentication:** Required (Farmers only - owner only)

**URL Parameters:**
```
id (required): string - Listing ID
```

**Request Body:** (All fields optional - only send fields to update)
```
crop_name (optional): string (2-100 chars)
crop_category (optional): enum
quantity (optional): number (positive)
unit (optional): enum
price_per_unit (optional): number (positive)
county (optional): string
description (optional): string (max 1000 chars)
available_date (optional): date (ISO 8601)
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/listings/cljy8x9q90000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price_per_unit": 3800
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "listing": {
    "id": "cljy8x9q90000",
    "quantity": 150,
    "pricePerUnit": 3800,
    "updatedAt": "2024-05-28T11:45:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "error": "Forbidden - You can only update your own listings"
}
```

---

### 5. Delete Listing (DELETE /api/listings/:id)

**Authentication:** Required (Farmers only - owner only)

**URL Parameters:**
```
id (required): string - Listing ID
```

**Note:** Soft delete - sets listing status to CANCELLED instead of permanent deletion

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/listings/cljy8x9q90000 \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Listing cancelled successfully",
  "listing": {
    "id": "cljy8x9q90000",
    "status": "CANCELLED",
    "updatedAt": "2024-05-28T12:00:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "error": "Forbidden - You can only delete your own listings"
}
```

---

## Error Responses

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Invalid input data |
| 400 | OTP not found or expired | OTP verification failed |
| 401 | No token provided | Missing authentication token |
| 403 | Invalid or expired token | Token is invalid/expired |
| 403 | Forbidden - Only FARMERs can access | User role does not have permission |
| 404 | Listing not found | Listing ID does not exist |
| 500 | Internal server error | Server error |

---

## Validation Rules

### Crop Name
- Required
- Length: 2-100 characters
- Type: String

### Crop Category
- Required
- Must be one of predefined categories

### Quantity
- Required
- Must be a positive number greater than 0

### Unit
- Required
- Allowed values: KG, BAG, CRATE, TONNE, LITRE, BUNCH, SACK

### Price Per Unit
- Required
- Must be a positive number greater than 0

### County
- Required (can be null initially, set in register-details)

### Available Date
- Required
- Must be valid ISO 8601 date format

### Description
- Optional
- Maximum 1000 characters

### Images
- Optional
- Maximum 5 files
- Maximum 10MB per file
- Supported formats: JPEG, PNG, WebP, GIF

---

## Image Upload

Images are automatically uploaded to Cloudinary and stored in the `mkulima-exchange/listings` folder. The secure URLs are returned in the listing response.

**Image Optimization:**
- Quality: Auto (Cloudinary optimization)
- Format: Auto (best format for browser)
- Storage: Cloudinary (reliable CDN)

---

## Listing Status

Listings can have the following statuses:

- `ACTIVE`: Available for purchase (default)
- `SOLD`: Product has been sold
- `CANCELLED`: Farmer has cancelled the listing

Only ACTIVE listings appear in search results.

---

## Usage Examples

### Example 1: Search for affordable tomatoes in Nakuru

```bash
curl "http://localhost:3000/api/listings?crop_name=Tomato&county=Nakuru&max_price=5000"
```

### Example 2: Create a listing with multiple images

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Authorization: Bearer <token>" \
  -F "crop_name=Fresh Tomatoes" \
  -F "crop_category=VEGETABLES" \
  -F "quantity=50" \
  -F "unit=CRATE" \
  -F "price_per_unit=2500" \
  -F "county=Nakuru" \
  -F "description=Fresh ripe tomatoes, pesticide-free" \
  -F "available_date=2024-06-15" \
  -F "images=@tomato1.jpg" \
  -F "images=@tomato2.jpg" \
  -F "images=@tomato3.jpg"
```

### Example 3: Filter by category and price range

```bash
curl "http://localhost:3000/api/listings?crop_category=FRUITS&min_price=1000&max_price=5000&page=1&limit=50"
```

---

## Next Steps

- Implement ordering system to allow buyers to place orders
- Add review system for completed transactions
- Implement payment processing with M-Pesa
- Add wishlist/saved listings feature
