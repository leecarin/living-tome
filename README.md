# The Living Tome

The Living Tome is a DM-focused companion project for a dynamic, digital version of [The Interactive Tome of Strahd](https://www.dmsguild.com/en/product/301867/the-interactive-tome-of-strahd) by The Aciduous Adventurer, inspired by the popular addition to the Curse of Strahd 5e module. The long-term vision is to give Dungeon Masters a flexible, atmospheric tool for presenting campaign content to players while allowing them to adapt, extend, or replace chapters as needed.

At the moment, the project is a working foundation for that experience: it includes an animated, book-like interface, Firebase-backed chapter authoring, and public chapter routes. Over time, it will support read-only pages based on the original mod content, DM accounts that can modify or create chapters, and richer rendering for HTML and Markdown content.

## What’s New

- An animated landing chapter with parchment-style motion and reveal effects.
- Firebase authentication for sign-in, Google OAuth, password reset, and admin access.
- An admin dashboard for creating, editing, hiding, deleting, and sharing custom chapter leaves.
- Public chapter pages at dynamic routes such as `/u/[user_id]/[slug]` for published leaves.
- Firestore-backed chapter persistence with shared serialization and route helpers.

## Project Goals

- Present campaign content in a visually immersive, book-like format.
- Support read-only pages derived from the original Interactive Tome of Strahd material.
- Let DMs customize chapter content for their own tables.
- Eventually support HTML and Markdown rendering for richer narrative formatting.
- Keep the experience lightweight, flexible, and easy to extend.

## Tech Stack

- Next.js 16 with the Pages Router
- React 19
- Motion for React
- TypeScript
- Firebase Authentication + Firestore
- Tailwind CSS 4
- Jest for testing

## Access the App

The project is currently deployed at https://living-tome-alpha.vercel.app/.

## Development Setup

### Prerequisites

- Node.js 20+
- npm
- A Firebase project with Authentication and Firestore enabled

### Environment Variables

Create a local environment file with the Firebase client settings:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Install and Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run start` - run the production build locally
- `npm run lint` - run ESLint
- `npm test` - run the Jest test suite
- `npm run seed` - run the Firestore seeding script

## Main Routes

- `/` - the animated opening chapter
- `/auth` - authentication flow for sign-in and account creation
- `/admin` - the chapter management dashboard
- `/u/[user_id]/[slug]` - a public chapter page for a published leaf

## Project Structure

- `src/pages/index.tsx` - the opening chapter experience
- `src/pages/auth/index.tsx` - authentication UI
- `src/pages/admin/index.tsx` - admin chapter management
- `src/pages/u/[user_id]/[slug].tsx` - public chapter route
- `src/lib/firebase/` - Firebase auth, client setup, and Firestore helpers
- `src/components/` - shared book layout, route protection, and UI components
