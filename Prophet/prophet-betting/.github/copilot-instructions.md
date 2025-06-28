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

## Key Features
1. **Bet Creation**: Users can create custom bets with titles, descriptions, deadlines
2. **Arbitrator Types**: 
   - Friend/family arbitrator (manual verification)
   - AI arbitrator (automated with appeal process)
3. **Bet Participation**: Users can join bets and make predictions
4. **Real-time Updates**: Live updates on bet status and resolutions
5. **User-friendly**: No crypto complexity, simple email/social login

## Database Schema
- `users`: User profiles and authentication
- `bets`: Bet details, creator, arbitrator info, deadlines
- `bet_participants`: User participation in bets with predictions
- `arbitrator_decisions`: Resolution outcomes and appeals

## Code Style Guidelines
- Use TypeScript for all files
- Follow Next.js 14 App Router patterns
- Use Tailwind CSS for styling with a modern, clean design
- Implement proper error handling and validation
- Use Supabase RLS (Row Level Security) for data protection
- Focus on user experience over technical complexity

## Priority Features for MVP
1. User authentication
2. Bet creation and browsing
3. Basic arbitrator workflow
4. Real-time bet updates
5. Simple payment system

## Avoid
- Overly complex UI
- Features that are extraneous for the MVP


## TODO

| **3. Authentication & Session Guard** | Everything else depends on `auth.uid()`. | • Build a minimal sign-up / login page (email + magic link)  
• Wrap your app in `<SessionContextProvider>` (Supabase React helpers) |
| **4. Edge Functions / RPC Layer** | Keep business logic server-side & RLS-safe. | Implement 3 POST endpoints:  
1️⃣ `createMarket` — inserts into `markets` / `bets` in one tx  
2️⃣ `placeBet` — verifies credit, inserts into `bet_participants`, logs `credit_transactions`  
3️⃣ `resolveBet` — writes to `arbitrator_decisions`, updates `bets.outcome/resolved_at`, pays out |
| **5. Minimal UI Flow** | Users need to feel the loop: create → join → resolve. | **Pages / components**  
- `/feed` (list active bets)  
- `/create` (form)  
- `/bet/[id]` (detail + join button + participant list) |
| **6. Credit Ledger Hooks** | Prevent negative balances & double-spend. | • Write a `useBalance()` hook that subscribes to `credit_transactions` realtime  
• Disable “Place Bet” button if credits < stake |
| **7. AI Arbitrator Stub** | You promised AI resolution—stub now, refine later. | • Edge Function `aiArbitrate(bet_id)` that:  
   1. Pulls bet details  
   2. Makes fake decision (`yes` 50 %) for now  
   3. Inserts into `arbitrator_decisions` |
| **8. Cypress or Playwright E2E** | Catch RLS or auth regressions quickly. | Test script: sign up → create bet → join with second user → AI resolve → payout shows up |
| **9. CI / CD Pipeline** | Ship confidently. | • GitHub Actions:  
  - `supabase db reset --force`  
  - Run migration script  
  - Run headless E2Es |
| **10. Polish & Launch Beta** | Get real feedback early. | • Seed a few fun markets  
• Invite 5–10 users  
• Capture usage & errors with Logflare or Sentry |

---

#### Immediate “Next 5 Hours” Sprint

1. **Commit the migration file** to `supabase/migrations`.  
2. **Bootstrap Next.js (or your chosen framework)**:  
   ```bash
   npx create-next-app@latest prophet --ts --tailwind
   cd prophet && pnpm add @supabase/supabase-js


####
Frontend Flow:
/signup → calls supabase.auth.signUp() → sends confirmation email
Email Link → /auth/callback → exchanges code for session → redirects to /feed

/login → calls supabase.auth.signInWithPassword() → redirects to /feed
Magic Link → /auth/callback → exchanges code for session → redirects to /feed

/auth/signout → clears session → redirects to /

Middleware Protection:
Any protected route → checks auth → redirects to /login if not authenticated
