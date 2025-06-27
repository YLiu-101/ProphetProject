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
