# Prophet Betting Platform - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Prophet is a peer-to-peer betting platform where users can create bets on anything (like "I'll get a 4.0 GPA") and have them arbitrated by friends or AI agents. The platform is designed for average users without requiring crypto wallets or web3 knowledge.

## Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **Authentication**: Supabase Auth (email/social login, no web3)
- **Payments**: Stripe (future integration)
- **AI**: OpenAI API for AI arbitrators
- **Deployment**: Vercel

## Current Implementation Status ✅

### ✅ Database Schema (Complete)
- **users**: User profiles and authentication data
- **markets**: Betting market categories and types
- **bets**: Individual bet instances with terms, deadlines, arbitrators
- **bet_participants**: User participation in bets with predictions and stakes
- **arbitrator_decisions**: Resolution outcomes and appeals
- **credit_transactions**: Financial ledger for all user transactions
- **Row Level Security (RLS)**: Enabled on all tables for data protection

### ✅ Authentication System (Complete)
- **Supabase Client Setup**: Browser and server-side clients configured
- **Middleware**: Auth protection for protected routes with automatic redirects
- **Login/Signup Pages**: Email/password and magic link authentication
- **Auth Callbacks**: Email confirmation and magic link handling
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Session Management**: Proper cookie handling and session persistence
- **Environment Variables**: Configured in `.env.local`

### ✅ Core File Structure (Complete)
```
src/
├── app/
│   ├── page.tsx (Landing page with auth redirect)
│   ├── layout.tsx 
│   ├── login/page.tsx (Login form with password/magic link)
│   ├── signup/page.tsx (Registration form)
│   ├── feed/page.tsx (Main dashboard - shows active bets)
│   ├── test-db/page.tsx (Database connection test)
│   └── auth/
│       ├── callback/route.ts (Auth confirmation handler)
│       ├── confirm/route.ts (Email verification handler)
│       ├── signout/route.ts (Logout handler)
│       └── auth-code-error/page.tsx (Auth error page)
├── lib/
│   ├── supabase.ts (Legacy client)
│   └── supabase/
│       ├── client.ts (Browser client)
│       └── server.ts (Server client)
├── hooks/
│   └── useIsClient.ts (Client-side detection hook)
├── types/
│   └── database.ts (TypeScript types for database)
└── middleware.ts (Auth middleware)
```

### ✅ Environment Configuration (Complete)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://htzjrdlvjuzbbnhfilii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (for AI arbitrators)
OPENAI_API_KEY=sk-proj-...

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ✅ Key Features Working
- **Database Connection**: Successfully tested and confirmed working
- **User Registration**: Email signup with confirmation flow
- **User Login**: Password and magic link authentication
- **Session Management**: Persistent login state across page refreshes
- **Route Protection**: Automatic redirects for protected pages
- **Error Handling**: Proper error pages and user feedback
- **Responsive UI**: Modern Tailwind CSS design

### 🔧 Known Issues & Solutions
1. **Email Confirmation Tokens Expiring**: OTP tokens expire quickly (5 min), causing "confirmation failed" errors
   - **Solution**: Tokens are short-lived by design for security
   - **Workaround**: Click email links immediately after receiving them
   - **Dev Option**: Can disable email confirmation in Supabase dashboard for development

2. **Hydration Warnings**: Fixed by using proper client-side detection and environment variables instead of `window` object during SSR

## Next Priority Features (TODO)

### 🎯 Phase 2: Core Betting Functionality
| Task | Description | Implementation Notes |
|------|-------------|---------------------|
| **Edge Functions / RPC Layer** | Server-side business logic endpoints | Implement 3 POST endpoints:<br/>1️⃣ `createMarket` — inserts into `markets` / `bets` in one tx<br/>2️⃣ `placeBet` — verifies credit, inserts into `bet_participants`, logs `credit_transactions`<br/>3️⃣ `resolveBet` — writes to `arbitrator_decisions`, updates `bets.outcome/resolved_at`, pays out |
| **Bet Creation Page** | `/create` form for new bets | Form with title, description, arbitrator selection, deadline |
| **Bet Detail Pages** | `/bet/[id]` individual bet pages | Show bet details, participant list, join buttons |
| **Real Data Integration** | Replace mock data in feed | Query actual bets from database |

### 🎯 Phase 3: Financial System
| Task | Description | Implementation Notes |
|------|-------------|---------------------|
| **Credit Ledger Hooks** | Prevent negative balances | `useBalance()` hook that subscribes to `credit_transactions` realtime<br/>Disable "Place Bet" button if credits < stake |
| **Credit Management** | User balance display and top-up | Show current balance, transaction history |
| **Payout System** | Distribute winnings after resolution | Calculate and distribute based on bet outcomes |

### 🎯 Phase 4: AI & Advanced Features
| Task | Description | Implementation Notes |
|------|-------------|---------------------|
| **AI Arbitrator** | Automated bet resolution | Edge Function `aiArbitrate(bet_id)` that:<br/>1. Pulls bet details<br/>2. Makes AI decision using OpenAI API<br/>3. Inserts into `arbitrator_decisions` |
| **Appeal System** | Contest AI decisions | Allow users to appeal AI arbitrator decisions |
| **Real-time Updates** | Live bet status changes | WebSocket connections for instant updates |

### 🎯 Phase 5: Testing & Deployment
| Task | Description | Implementation Notes |
|------|-------------|---------------------|
| **E2E Testing** | Cypress or Playwright tests | Test script: sign up → create bet → join with second user → AI resolve → payout shows up |
| **CI/CD Pipeline** | Automated testing and deployment | GitHub Actions with Supabase migrations and E2E tests |
| **Production Setup** | Environment configuration | Production Supabase project, domain setup |

## Key Features
1. **Bet Creation**: Users can create custom bets with titles, descriptions, deadlines
2. **Arbitrator Types**: 
   - Friend/family arbitrator (manual verification)
   - AI arbitrator (automated with appeal process)
3. **Bet Participation**: Users can join bets and make predictions
4. **Real-time Updates**: Live updates on bet status and resolutions
5. **User-friendly**: No crypto complexity, simple email/social login

## Code Style Guidelines
- Use TypeScript for all files
- Follow Next.js 14 App Router patterns
- Use Tailwind CSS for styling with a modern, clean design
- Implement proper error handling and validation
- Use Supabase RLS (Row Level Security) for data protection
- Focus on user experience over technical complexity
- Handle hydration properly with client-side detection hooks

## Database Access Patterns
- Use server components for initial data loading
- Use client components for interactive features
- Implement proper error boundaries
- Use Supabase real-time subscriptions for live updates
- Always use RLS policies for data security

## Authentication Flow
1. **Landing page** (`/`) → redirects to `/feed` if logged in, shows signup/login buttons if not
2. **Signup** (`/signup`) → email confirmation → redirect to `/feed`
3. **Login** (`/login`) → password or magic link → redirect to `/feed`
4. **Protected routes** → automatic redirect to `/login` if not authenticated
5. **Logout** → `/auth/signout` → redirect to `/`

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- Database testing available at `/test-db`

## Deployment Notes
- Environment variables must be set in production
- Supabase project needs production configuration
- Email confirmation must be properly configured for production domains
- Consider disabling email confirmation in development for faster testing

## Priority Features for MVP
1. ✅ User authentication  
2. ✅ Database connection
3. 🔄 Bet creation and browsing
4. 🔄 Basic arbitrator workflow
5. 🔄 Real-time bet updates
6. 🔄 Simple payment system

## Avoid
- Overly complex UI
- Features that are extraneous for the MVP
- Crypto/Web3 complexity
- Features requiring user wallets
