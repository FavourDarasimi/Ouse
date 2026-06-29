# Ouse — Project Overview

> **Ouse** is a Nigerian rental property platform that connects tenants directly with landlords. Built with Next.js 16, Supabase, Tailwind CSS 4, Framer Motion, and Context API.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.6 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Auth & Database** | Supabase (SSR, Realtime, Storage) |
| **Deployment** | Vercel |

---

## Routes & Pages

### Public (unauthenticated)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/(public)/page.tsx` | Landing page with hero section, search CTA, and stats (2,400+ listings, 850+ landlords, 15,000+ happy tenants, 98% satisfaction) |
| `/listings` | `app/(public)/listings/page.tsx` | Explore/browse all available listings with filters (search, type, price, beds, baths, rent type, availability) and grid/list view toggle |
| `/listings/[id]` | `app/(public)/listings/[id]/page.tsx` | Listing detail page with images, landlord info (name, avatar, KYC badge), description, amenities, and contact buttons |

### Authentication

| Route | File | Description |
|-------|------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | Login with email/password, Google OAuth, forgot password link. Showcase panel with testimonial and stats |
| `/signup` | `app/(auth)/signup/page.tsx` | Sign up with email/password, Google OAuth. Same showcase panel |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Request password reset email |
| `/update-password` | `app/(auth)/update-password/page.tsx` | Set new password after reset |
| `/auth/callback` | `app/auth/callback/route.ts` | OAuth callback — exchanges code for session, redirects to `/onboarding` |

### Onboarding

| Route | File | Description |
|-------|------|-------------|
| `/onboarding` | `app/onboarding/page.tsx` | Role selection (Tenant / Landlord) after first signup. Creates profile in DB |

### Landlord (authenticated)

| Route | File | Description |
|-------|------|-------------|
| `/landlord/dashboard` | `app/landlord/dashboard/page.tsx` | Overview: greeting, stats (active listings, unread messages, total listings, saved count), recent listings, recent conversations |
| `/landlord/listings` | `app/landlord/listings/page.tsx` | Full property management. Stats cards (total/active/inactive). Each card has edit, activate/deactivate, delete actions |
| `/landlord/messages` | `app/landlord/messages/page.tsx` | Inbox — all conversations as threads with search, unread badges, real-time updates |
| `/landlord/messages/[chatId]` | `app/landlord/messages/[chatId]/page.tsx` | Individual conversation with full message history, real-time messaging, property context bar |
| `/landlord/profile` | `app/landlord/profile/page.tsx` | Profile management: avatar upload, name edit, KYC status/badge, stats |
| `/landlord/explore` | `app/landlord/explore/page.tsx` | Public listing browser for landlords |

### Tenant (authenticated)

| Route | File | Description |
|-------|------|-------------|
| `/tenant/dashboard` | `app/tenant/dashboard/page.tsx` | Dashboard with hero search, category chips, popular locations, featured listings, saved listings, recent chats |
| `/tenant/messages` | `app/tenant/messages/page.tsx` | Inbox — all conversations as threads |
| `/tenant/messages/[chatId]` | `app/tenant/messages/[chatId]/page.tsx` | Individual conversation with full message history |
| `/tenant/saved` | `app/tenant/saved/page.tsx` | Saved/favourited listings with grid/list view toggle and search |
| `/tenant/profile` | `app/tenant/profile/page.tsx` | Profile management: avatar upload, name edit, stats |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/listings` | POST | Create a listing (auth + KYC-gated availability) |
| `/api/listings` | PUT | Update a listing (auth + KYC-gated activation) |
| `/api/listings/[id]` | DELETE | Delete a listing |
| `/api/upload` | POST | Upload image files to Supabase Storage |

---

## Context Providers

| Provider | File | State Managed |
|----------|------|---------------|
| **ThemeProvider** | `context/ThemeContext.tsx` | Dark/light theme, localStorage persistence |
| **AuthProvider** | `context/AuthContext.tsx` | User, profile, role, onboarding status, KYC fields, sign out, refresh profile |
| **FavouritesProvider** | `context/FavouritesContext.tsx` | Favourited listing IDs, toggle function, loading state |
| **ChatProvider** | `context/ChatContext.tsx` | Floating chat state (open/close, conversation ID, other person info, property info) |
| **AddListingProvider** | `context/AddListingContext.tsx` | Add/Edit listing panel open state, editing listing reference |

### Provider Hierarchy (in `app/layout.tsx`)

```
ThemeProvider
  └─ AuthProvider
       └─ FavouritesProvider
            └─ ChatProvider
                 └─ FloatingChat
```

---

## Layouts

| Layout | File | Includes |
|--------|------|----------|
| **Root** | `app/layout.tsx` | All providers, FloatingChat, dark mode inline script |
| **Public** | `app/(public)/layout.tsx` | Navbar, ConditionalBottomNav |
| **Landlord** | `app/landlord/layout.tsx` | Sidebar, Navbar, MobileBottomNav, AddListingPanel, AddListingFAB, AddListingProvider |
| **Tenant** | `app/tenant/layout.tsx` | Navbar, TenantBottomNav |

---

## Components

### Shared / UI

| Component | Description |
|-----------|-------------|
| `Logo` | SVG logo with dark mode variant and configurable size |
| `HeroSection` | Landing page hero with image collage, headline, CTA, and stats grid |
| `AnimatedSection` | Wrapper for scroll-triggered fade-in animations (viewport) |
| `StaggerContainer` / `StaggerItem` | Parent-child staggered fade-in animation system |
| `DashboardStatsCard` | Stats display card with optional hero variant |
| `SkeletonCard` | Loading placeholder for listing cards |
| `ConfirmModal` | Generic confirm/cancel modal with loading state |
| `ViewToggle` | Grid/list view switch |
| `VerifiedBadge` | KYC verified checkmark badge (small/large with optional label) |

### Layout

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive top navigation. 3 variants: unauthenticated (public links + login/signup), tenant (explore/saved/inbox + avatar dropdown), landlord (minimal + add listing + avatar dropdown) |
| `Sidebar` | Fixed left sidebar for landlords (overview, properties, enquiries links + profile footer). Unread count badge on enquiries |
| `AvatarDropdown` | Reusable user menu dropdown (profile card with initials/avatar/email, profile link, logout) |
| `MobileBottomNav` | Bottom tab navigation for mobile (tenant and landlord variants with icons) |
| `ConditionalBottomNav` | Conditionally shows mobile bottom nav on listing pages for logged-in users |

### Listings

| Component | Description |
|-----------|-------------|
| `ExploreListings` | Client-side filtered/ paginated listing grid with loading, empty, and pagination states |
| `ListingsFilter` | Filter controls: search input, property type chips, price range Slider, beds/baths select, rent type toggle, availability toggle, clear all |
| `ListingCard` | Grid card with image, title, price, location, beds/baths badges, landlord name, verified badge, favourite heart |
| `ListingRow` | List view row variant of ListingCard |
| `ListingPreviewCard` | Compact card for dashboard "My Listings" section |
| `PropertyCard` | Landlord property management card: edit, activate/deactivate (KYC-gated), delete, view listing link |
| `AddListingPanel` | Slide-in panel for creating/editing listings. Form fields: title, description, price, rent type, location, area, property type, beds/baths, availability toggle (KYC-gated), image upload with drag-to-reorder |
| `AddListingButton` | Button to open AddListingPanel |
| `AddListingFAB` | Floating action button on mobile to open AddListingPanel |

### Chat

| Component | Description |
|-----------|-------------|
| `ChatShell` | Full inbox + conversation view. Two-column layout: thread list (searchable) + message area. Real-time subscriptions for new conversations and messages. Optimistic message sending. Date-grouped messages |
| `FloatingChat` | Floating chat widget (fixed bottom-right). Minimizable. Real-time messages. Property context bar. Full conversation expand link |
| `ConversationListItem` | Dashboard conversation card with avatar, name, listing title, latest message, time, unread indicator |
| `MessageBubble` | Individual message bubble (own/other styling) |
| `ChatInput` | Message input with send button |

### KYC (Know Your Customer)

| Component | Description |
|-----------|-------------|
| `KycModal` | Modal for identity verification via NIN or BVN. Uses Dojah API. Form with ID number input and method selection |
| `KycStatusCard` | Status display card showing current KYC level, status badge, and method info |
| `KycBanner` | Warning banner shown on landlord dashboard if KYC is unverified, prompting verification |

### Profile

| Component | Description |
|-----------|-------------|
| `ProfileAvatarUpload` | Avatar image upload with preview and Supabase Storage upload |
| `ProfileHeader` | Profile header with avatar, name, role, email |
| `ProfileForm` | Edit name and other profile details |
| `ProfileStats` | Stats display: listings count, active listings, response rate (landlord) |

---

## Hooks

| Hook | Description |
|------|-------------|
| `useUnreadCount` | Real-time unread message count via Supabase Realtime subscriptions. Listens for new conversations, new messages, and read status updates |
| `useViewMode` | Persists grid/list view preference to localStorage |

---

## Lib / Actions

### Supabase Clients

| File | Description |
|------|-------------|
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/server.ts` | Server component/route handler Supabase client (cookie-based) |
| `lib/supabase/admin.ts` | Service-role admin client (bypasses RLS) |

### Actions

| File | Functions |
|------|-----------|
| `lib/actions/auth.ts` | `completeOnboarding(role)` — sets profile role + onboarded flag |
| `lib/actions/conversations.ts` | `findOrCreateConversation(listingId, landlordId)` — finds or creates a conversation between tenant and landlord |
| `lib/actions/messages.ts` | `sendMessage(conversationId, body)`, `getMessages(conversationId)`, `markMessagesAsRead(conversationId, userId)` |
| `lib/actions/kyc.ts` | `submitKyc(method, idNumber)` — submits KYC verification via Dojah API. Updates profile kyc_status |
| `lib/actions/profile.ts` | Profile update actions |

### Utils

| File | Functions |
|------|-----------|
| `lib/utils/formatDate.ts` | `formatRelativeTime(dateString)` — human-readable relative time (e.g. "2 min ago") |
| `lib/utils/formatPrice.ts` | `formatPrice(price, rentType?)` — formatted NGN price display |
| `lib/utils/getInitials.ts` | `getInitials(name?)` — extract initials from full name |
| `lib/utils/motionVariants.ts` | `fadeUp`, `staggerContainer` — reusable Framer Motion variants |

---

## Middleware (`proxy.ts`)

Route protection with 6 rules:
1. **Unauthenticated** → protect `/landlord`, `/tenant`, `/onboarding` routes (redirect to `/login`)
2. **Authenticated on `/login` or `/signup`** → redirect to `/onboarding`
3. **Not onboarded** → only allow `/onboarding` and `/auth/*`
4. **Onboarded on `/onboarding`** → redirect to role dashboard
5. **Cross-role access** → redirect landlord→landlord/dashboard, tenant→tenant/dashboard
6. **Root path `/`** → redirect authenticated users to role dashboard

---

## Database Schema (Supabase)

### Tables

| Table | Key Columns |
|-------|-------------|
| `profiles` | `id` (FK auth.users), `role`, `full_name`, `avatar_url`, `phone`, `onboarded`, `kyc_status`, `kyc_method`, `kyc_verified_at`, `kyc_reference`, `created_at` |
| `listings` | `id`, `landlord_id` (FK profiles), `title`, `description`, `price`, `rent_type`, `location`, `area`, `type`, `bedrooms`, `bathrooms`, `available`, `images` (text[]), `created_at`, `updated_at` |
| `conversations` | `id`, `listing_id` (FK listings), `tenant_id` (FK profiles), `landlord_id` (FK profiles), `created_at` |
| `messages` | `id`, `conversation_id` (FK conversations), `sender_id`, `body`, `read`, `created_at` |
| `favourites` | `id`, `tenant_id`, `listing_id`, `created_at` |

### RLS Policies

| Table | Policy |
|-------|--------|
| `profiles` | Users can read any profile. Users can update own profile |
| `listings` | Anyone can read available listings. Landlords can CRUD own listings |
| `conversations` | Participants can read. Tenants can create |
| `messages` | Participants can read. Participants can insert with own sender_id |
| `favourites` | Users can read/insert/delete own favourites |

---

## Key Features

### Authentication & Authorization
- Email/password auth with Supabase
- Google OAuth
- Password reset flow (forgot password → email → update password)
- Persistent sessions via SSR cookies
- Route protection middleware with role-based access

### Onboarding Flow
- Choose between Tenant and Landlord role
- Role is permanent once selected
- Redirects to role-specific dashboard after onboarding

### Listing Management (Landlord)
- Create, edit, delete listings
- Image upload to Supabase Storage with drag-to-reorder
- Availability toggle gated behind KYC verification
- View listing statistics (total, active, inactive, saves)
- Bulk listing management from dashboard

### Property Browsing (Tenant / Public)
- Grid and list view modes (persisted to localStorage)
- Client-side filtering: text search, property type, price range, bedrooms, bathrooms, rent type, availability
- Pagination (12 items per page)
- Favourites with optimistic UI updates
- Landlord verification badges on cards

### Real-time Chat
- Two-column inbox with search
- Real-time message delivery via Supabase Realtime
- Unread message badges with real-time updates
- Floating chat widget on listing detail pages
- Optimistic message sending
- Mark as read on conversation open
- KYC status displayed in chat header and thread list

### KYC (Identity Verification)
- NIN (National Identification Number) verification
- BVN (Bank Verification Number) verification
- Three states: unverified, pending, verified, failed
- Listings cannot be marked available until landlord is verified
- Verified badges displayed on listing cards, detail view, and chat
- Warning banners on dashboard and listing forms

### Dark Mode
- System-preference-aware with manual toggle
- Persisted to localStorage
- Inline script prevents flash of unstyled content on load
- Full CSS variable theme system

### Profile Management
- Avatar upload with preview
- Name and profile editing
- Stats display (listings, saves, messages)
- KYC status overview

### Animations & UX
- Framer Motion page transitions and stagger animations
- Scroll-triggered viewport animations
- Hover effects on cards and buttons
- Loading skeletons
- Error states with actionable feedback
- Empty states with illustrations and CTAs

---

## Project Structure

```
ouse/
├── app/
│   ├── (auth)/                      # Auth pages (login, signup, forgot/reset password)
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── signup/
│   │   └── update-password/
│   ├── (public)/                    # Public pages (home, listings)
│   │   ├── listings/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                         # API routes
│   │   ├── listings/
│   │   └── upload/
│   ├── auth/callback/
│   ├── landlord/                    # Landlord pages
│   │   ├── dashboard/
│   │   ├── explore/
│   │   ├── listings/
│   │   ├── messages/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── tenant/                      # Tenant pages
│   │   ├── dashboard/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── saved/
│   │   └── layout.tsx
│   ├── onboarding/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── chat/                        # Chat components
│   ├── kyc/                         # KYC verification components
│   ├── layout/                      # Navbar, Sidebar, BottomNav, AvatarDropdown
│   ├── listings/                    # Listing card, form, filter, explore
│   ├── profile/                     # Profile editing components
│   ├── shared/                      # Reusable UI (Logo, ConfirmModal, etc.)
│   └── ui/                          # Small UI primitives (VerifiedBadge, ViewToggle)
├── context/                         # React Context providers
├── hooks/                           # Custom hooks
├── lib/
│   ├── actions/                     # Server actions
│   ├── hooks/                       # Library-specific hooks
│   ├── supabase/                    # Supabase client instances
│   └── utils/                       # Formatting, animation helpers
├── types/                           # TypeScript type definitions
├── proxy.ts                         # Middleware for route protection
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```
