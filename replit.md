# ActiveSenior - 액티브 시니어 여가생활 매칭 플랫폼

## Overview

ActiveSenior is a leisure activity matching platform designed specifically for active seniors (ages 50-60). The platform enables users to discover companions with similar interests for activities like performances, trekking, sports, and cultural events. The application features profile matching, activity discovery, real-time chat, and community engagement.

The project follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for senior-friendly accessibility
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

The frontend is organized under `client/src/` with:
- `pages/` - Route-level components (landing, home, activities, profile, chat, community)
- `components/` - Reusable UI components including shadcn/ui library
- `hooks/` - Custom React hooks (auth, toast, mobile detection)
- `lib/` - Utilities and query client configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect (OAuth 2.0)
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful endpoints under `/api/` prefix

The backend is organized under `server/` with:
- `routes.ts` - API route definitions
- `storage.ts` - Data access layer with typed interfaces
- `db.ts` - Drizzle database connection
- `replit_integrations/auth/` - Authentication module with Replit OIDC

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - Contains all table definitions
- **Migrations**: Generated via `drizzle-kit push`

Core entities include:
- Users and Sessions (required for Replit Auth)
- Profiles (extended user preferences and verification status)
- Activities (leisure activity listings with participants)
- Chat Rooms and Messages
- Community Posts with comments and likes
- Friends relationships

### Authentication Flow
The application uses Replit's built-in authentication:
1. Users authenticate via `/api/login` which redirects to Replit OIDC
2. Sessions are stored in PostgreSQL `sessions` table
3. User data is upserted into `users` table on login
4. Protected routes use `isAuthenticated` middleware
5. Frontend checks auth status via `/api/auth/user` endpoint

### Design System
- **Typography**: Noto Sans KR (Korean font) via Google Fonts
- **Accessibility Focus**: Large touch targets (min-h-16), high contrast, simplified navigation
- **Theme Support**: Light/dark mode with CSS variables
- **Component Style**: New York style shadcn/ui configuration

## External Dependencies

### Database
- **PostgreSQL**: Primary database (provisioned via Replit)
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session store

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware
- **openid-client**: OIDC client library

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **lucide-react**: Icon library
- **date-fns**: Date formatting with Korean locale
- **embla-carousel-react**: Carousel component
- **vaul**: Drawer component

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Replit environment identifier