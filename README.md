# The Living Tome

The Living Tome is a Next.js experience built for D&D players: an animated open book that fills with text as if it is being written by an invisible hand. The project uses Motion for the page and text transitions, with a parchment-and-leather visual style that keeps the whole app feeling like a fantasy artifact instead of a generic web page.

## What’s Inside

- A motion-driven home chapter that reveals text letter by letter.
- A shared chapter shell with navigation for the book’s routes.
- A second chapter, `Epilogue`, rendered as a two-page spread.
- Shared reveal timing in `src/lib/chapterTiming.ts` so the writing pace stays consistent across chapters.

## Tech Stack

- Next.js 16 with the Pages Router
- React 19
- Motion for React
- Tailwind CSS 4
- TypeScript

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint

## Routes

- `/` - the main living tome chapter
- `/epilogue` - the epilogue chapter shown in the book navigation

## Project Structure

- `src/pages/_app.tsx` - global shell and chapter navigation
- `src/pages/index.tsx` - the animated landing chapter
- `src/pages/epilogue.tsx` - the chapter renamed from `last-dusk.tsx`
- `src/lib/chapterTiming.ts` - shared reveal timing constants
- `src/styles/globals.css` - global parchment and candlelit styling

## Notes

This project is intentionally stylized for atmosphere. The layout, typography, and animation are designed to feel like a physical fantasy book rather than a standard app shell.
