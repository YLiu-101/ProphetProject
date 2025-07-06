# Prophet Betting Platform - Backend API Documentation

## Overview

The Prophet Betting Platform provides a comprehensive RESTful API for creating and managing peer-to-peer betting markets. The backend is built with Next.js 14 App Router, Supabase for authentication and database, and includes robust validation, error handling, and security features.

## Base URL
```
https://your-domain.com/api
```

## Authentication

All protected endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE", // Optional error code
  "validation_errors": [ // For validation errors
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## API Endpoints

### 1. Create Market/Bet

Create a new betting market with an associated bet.

**Endpoint:** `POST /api/create-market`
**Authentication:** Required

**Request Body:**
```json
{
  "title": "I will get a 4.0 GPA this semester",
  "description": "Detailed description of the bet conditions and criteria",
  "deadline": "2024-12-15T23:59:59Z",
  "arbitrator_type": "friend", // "creator", "friend", or "ai"
  "arbitrator_email": "friend@example.com", // Required for "friend" type
  "market_type": "binary", // "binary", "multiple_choice", or "numeric"
  "stake_amount": 10 // Minimum stake amount in credits
}
```

**Response:**
```json
{
  "success": true,
  "bet_id": "uuid",
  "market_id": "uuid"
}
```

**Validation Rules:**
- `title`: Required, 3-200 characters
- `description`: Required, 10-1000 characters
- `deadline`: Required, must be in the future
- `arbitrator_type`: Required, must be "creator", "friend", or "ai"
- `arbitrator_email`: Required for "friend" arbitrator type, must be valid email
- `stake_amount`: Required, must be positive number

### 2. Place Bet

Place a bet on an existing market.

**Endpoint:** `POST /api/place-bet`
**Authentication:** Required

**Request Body:**
```json
{
  "bet_id": "uuid",
  "prediction": true, // true for "yes", false for "no"
  "stake_amount": 25 // Amount in credits
}
```

**Response:**
```json
{
  "success": true,
  "participant_id": "uuid",
  "new_balance": 75.00
}
```

**Error Codes:**
- `BET_RESOLVED`: Bet is already resolved
- `DEADLINE_PASSED`: Bet deadline has passed
- `ALREADY_PARTICIPATED`: User already placed a bet
- `INSUFFICIENT_CREDITS`: User doesn't have enough credits

### 3. Resolve Bet

Resolve a bet (only for authorized arbitrators).

**Endpoint:** `POST /api/resolve-bet`
**Authentication:** Required

**Request Body:**
```json
{
  "bet_id": "uuid",
  "outcome": true, // true for "yes", false for "no"
  "reasoning": "Explanation of the decision"
}
```

**Response:**
```json
{
  "success": true,
  "decision_id": "uuid",
  "total_payout": 150.00,
  "winners_count": 3
}
```

**Authorization Rules:**
- Creator can resolve if `arbitrator_type` is "creator"
- Friend can resolve if their email matches `arbitrator_email`
- AI bets must use the AI arbitration endpoint

### 4. AI Arbitration

Automatically resolve a bet using AI arbitration.

**Endpoint:** `POST /api/ai-arbitrate`
**Authentication:** Optional (can be called by system)

**Request Body:**
```json
{
  "bet_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "ai_decision": true,
  "reasoning": "AI reasoning for the decision",
  "decision_id": "uuid",
  "total_payout": 200.00,
  "winners_count": 5
}
```

### 5. User Balance & History

Get user's credit balance and transaction history.

**Endpoint:** `GET /api/user/balance`
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "balance": 125.50,
  "recent_transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "transaction_type": "payout",
      "description": "Bet winnings",
      "created_at": "2024-01-15T10:30:00Z",
      "bet_id": "uuid"
    }
  ],
  "active_bets": [
    {
      "id": "uuid",
      "prediction": true,
      "stake_amount": 25.00,
      "created_at": "2024-01-10T15:00:00Z",
      "bets": {
        "id": "uuid",
        "title": "Bet title",
        "deadline": "2024-02-01T23:59:59Z",
        "resolved": false
      }
    }
  ],
  "stats": {
    "total_transactions": 15,
    "active_bets_count": 3
  }
}
```

### 6. List Markets

Get paginated list of available markets.

**Endpoint:** `GET /api/markets`
**Authentication:** Optional

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `category`: Filter by category
- `search`: Search in name/description
- `sort`: Sort field (default: created_at)
- `order`: Sort order "asc" or "desc" (default: desc)

**Response:**
```json
{
  "markets": [
    {
      "id": "uuid",
      "name": "Sports Predictions",
      "description": "Sports events and game outcomes",
      "category": "sports",
      "type": "binary",
      "total_bets": 15,
      "total_pool": 1250.00,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

### 7. List Bets

Get paginated list of betting markets/questions.

**Endpoint:** `GET /api/bets`
**Authentication:** Optional (but required for user participation info)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `status`: Filter by status ("active", "resolved", "expired", "all")
- `category`: Filter by market category
- `search`: Search in title/description
- `creator_id`: Filter by creator
- `arbitrator_type`: Filter by arbitrator type
- `sort`: Sort field (default: created_at)
- `order`: Sort order "asc" or "desc" (default: desc)

**Response:**
```json
{
  "bets": [
    {
      "id": "uuid",
      "title": "I will get a 4.0 GPA this semester",
      "description": "Detailed description...",
      "creator": {
        "id": "uuid",
        "username": "john_doe",
        "full_name": "John Doe"
      },
      "market": {
        "id": "uuid",
        "name": "Education Predictions",
        "category": "education"
      },
      "deadline": "2024-05-15T23:59:59Z",
      "arbitrator_type": "friend",
      "resolved": false,
      "outcome": null,
      "participant_count": 8,
      "total_pool": 200.00,
      "user_participation": { // Only if authenticated
        "prediction": true,
        "stake_amount": 25.00
      },
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

### 8. Get Bet Details

Get detailed information about a specific bet.

**Endpoint:** `GET /api/bets/{id}`
**Authentication:** Optional (but required for user participation info)

**Response:**
```json
{
  "bet": {
    "id": "uuid",
    "title": "I will get a 4.0 GPA this semester",
    "description": "Detailed description...",
    "creator": {
      "id": "uuid",
      "username": "john_doe",
      "full_name": "John Doe"
    },
    "market": {
      "id": "uuid",
      "name": "Education Predictions",
      "category": "education"
    },
    "deadline": "2024-05-15T23:59:59Z",
    "arbitrator_type": "friend",
    "arbitrator_email": "friend@example.com",
    "minimum_stake": 5.00,
    "resolved": false,
    "outcome": null,
    "resolved_at": null,
    "total_pool": 200.00,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "participants": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "alice",
        "full_name": "Alice Smith"
      },
      "prediction": true,
      "stake_amount": 25.00,
      "created_at": "2024-01-02T10:00:00Z"
    }
  ],
  "decision": null, // Only present if resolved
  "user_participation": { // Only if authenticated and participated
    "prediction": true,
    "stake_amount": 25.00
  },
  "stats": {
    "total_participants": 8,
    "yes_count": 5,
    "no_count": 3,
    "yes_amount": 125.00,
    "no_amount": 75.00,
    "potential_payout_yes": 1.6, // Multiplier
    "potential_payout_no": 2.67
  }
}
```

## Database Schema

### Core Tables

1. **users** - User profiles synced from Supabase Auth
2. **markets** - Betting market categories
3. **bets** - Individual betting questions/markets
4. **bet_participants** - User participation in bets
5. **arbitrator_decisions** - Final arbitration outcomes
6. **credit_transactions** - Complete financial ledger

### RPC Functions

The API uses PostgreSQL stored procedures for complex operations:

1. **create_market_with_bet()** - Atomically creates market and bet
2. **place_bet()** - Handles credit verification and bet placement
3. **resolve_bet()** - Manages payout calculation and distribution

## Security Features

1. **Row Level Security (RLS)** - Database-level access control
2. **Input Validation** - Comprehensive server-side validation
3. **Rate Limiting** - Basic rate limiting implementation
4. **Authentication** - Supabase Auth JWT token verification
5. **Error Handling** - Consistent error responses without data leakage

## Getting Started

1. Set up Supabase project and configure environment variables
2. Run the updated database schema: `supabase/updated_schema.sql`
3. Execute RPC functions: `supabase/rpc_functions.sql`
4. Configure OpenAI API key for AI arbitration
5. Deploy and test endpoints

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for AI arbitration)
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=your_app_url
```

## Testing

Use tools like Postman, curl, or any HTTP client to test the endpoints. Ensure you have proper authentication tokens for protected routes.

### Example curl commands:

```bash
# Create a bet
curl -X POST https://your-domain.com/api/create-market \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bet",
    "description": "This is a test bet",
    "deadline": "2024-12-31T23:59:59Z",
    "arbitrator_type": "creator",
    "stake_amount": 10
  }'

# Place a bet
curl -X POST https://your-domain.com/api/place-bet \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "bet_id": "your-bet-id",
    "prediction": true,
    "stake_amount": 25
  }'
```
