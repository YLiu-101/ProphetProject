# Prophet Betting Platform - Backend Setup Guide

## Overview

This guide will help you set up and test the Prophet Betting Platform backend. The backend is fully implemented with all core features including market creation, bet placement, bet resolution, AI arbitration, and user balance management.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** and project
3. **OpenAI API Key** (for AI arbitration)
4. **Git** for version control

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for AI arbitration)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Database Setup

1. **Execute the updated schema:**
   ```sql
   -- Run the contents of supabase/updated_schema.sql in your Supabase SQL editor
   ```

2. **Install RPC functions:**
   ```sql
   -- Run the contents of supabase/rpc_functions.sql in your Supabase SQL editor
   ```

3. **Verify tables are created:**
   - users
   - markets
   - bets
   - bet_participants
   - arbitrator_decisions
   - credit_transactions

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The server will start at `http://localhost:3000`

## Backend API Endpoints

The following endpoints are fully implemented and ready for use:

### Core Betting Operations

1. **POST /api/create-market** - Create new betting markets
2. **POST /api/place-bet** - Place bets on markets
3. **POST /api/resolve-bet** - Resolve bets (manual arbitration)
4. **POST /api/ai-arbitrate** - AI-powered bet resolution

### Data Retrieval

5. **GET /api/bets** - List all bets with filtering and pagination
6. **GET /api/bets/[id]** - Get detailed bet information
7. **GET /api/markets** - List all markets with filtering
8. **GET /api/user/balance** - Get user credit balance and transaction history

## Testing the Backend

### Option 1: API Testing Tools

Use Postman, Insomnia, or curl to test endpoints:

```bash
# Example: Create a bet (requires authentication)
curl -X POST http://localhost:3000/api/create-market \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bet",
    "description": "This is a test betting market",
    "deadline": "2024-12-31T23:59:59Z",
    "arbitrator_type": "creator",
    "stake_amount": 10
  }'

# Example: Get public bet list (no auth required)
curl http://localhost:3000/api/bets?limit=5
```

### Option 2: Test Script

Run the included test script:

```bash
node scripts/test-api.js
```

### Option 3: Development Tasks

Use VS Code tasks to run the development server:

```bash
# Use the "dev" task in VS Code
# Or manually:
npm run dev
```

## Database Functions (RPC)

The backend uses PostgreSQL stored procedures for complex operations:

### 1. create_market_with_bet()
- Creates market and associated bet atomically
- Gives new users welcome bonus credits
- Returns market_id and bet_id

### 2. place_bet()
- Verifies user has sufficient credits
- Prevents duplicate participation
- Records bet and deducts credits
- Returns participant_id and new balance

### 3. resolve_bet()
- Creates arbitrator decision record
- Calculates and distributes winnings
- Handles edge cases (no winners, ties)
- Updates bet status to resolved

## Authentication Flow

The backend uses Supabase Auth with JWT tokens:

1. **User Registration/Login** → Handled by Supabase Auth
2. **JWT Token** → Included in Authorization header
3. **Middleware** → Validates tokens on protected routes
4. **Row Level Security** → Database-level access control

## Credit System

Users operate with a credit-based system:

- **Welcome Bonus:** 100 credits for new users
- **Bet Placement:** Deducts stake amount
- **Winnings:** Proportional distribution to winners
- **Refunds:** Full refund if no winners

## Error Handling

The API provides comprehensive error handling:

- **Validation Errors:** Field-specific validation messages
- **Business Logic Errors:** Domain-specific error codes
- **Authentication Errors:** Proper 401/403 responses
- **Database Errors:** Graceful error mapping

## Security Features

1. **Row Level Security (RLS)** on all tables
2. **Input validation** on all endpoints
3. **SQL injection prevention** via parameterized queries
4. **Rate limiting** (basic implementation)
5. **Error sanitization** (no sensitive data leakage)

## API Documentation

Comprehensive API documentation is available in `API_DOCUMENTATION.md` including:

- Complete endpoint reference
- Request/response examples
- Error codes and handling
- Authentication requirements
- Database schema overview

## Production Deployment

For production deployment:

1. **Environment Variables:** Set production values
2. **Database:** Use production Supabase instance
3. **OpenAI:** Use production API key with billing
4. **Monitoring:** Add error tracking (Sentry, LogFlare)
5. **Security:** Enable CORS, HTTPS, rate limiting

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase environment variables
   - Check project URL and API keys
   - Ensure database schema is applied

2. **Authentication Failures**
   - Verify JWT token format
   - Check token expiration
   - Ensure user exists in database

3. **RPC Function Errors**
   - Verify functions are installed in database
   - Check function permissions
   - Review function parameters

4. **AI Arbitration Issues**
   - Verify OpenAI API key
   - Check API quota and billing
   - Review prompt formatting

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Next Steps

The backend is fully functional and ready for:

1. **Frontend Integration** - Connect React components to API
2. **Advanced Features** - Appeals, admin tools, analytics
3. **Testing** - Comprehensive test suite
4. **Monitoring** - Error tracking and performance monitoring
5. **Scaling** - Database optimization and caching

## Support

For issues or questions:

1. Check the API documentation
2. Review error logs in the console
3. Verify database schema and functions
4. Test with minimal examples

The Prophet Betting Platform backend provides a robust foundation for peer-to-peer betting with comprehensive features, security, and error handling.
