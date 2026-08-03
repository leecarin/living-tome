# The Living Tome (Interactive Tome of Strahd Digital Companion)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> A dynamic, atmospheric digital companion for Dungeon Masters running **Curse of Strahd** and the popular _[The Interactive Tome of Strahd mod](https://www.dmsguild.com/en/product/301867/the-interactive-tome-of-strahd)_.

**The Living Tome** provides DMs with a book-like, interactive interface to present campaign lore to players. It bridges the gap between static PDF handouts and full-table immersion, allowing DMs to customize, extend, or hide chapter leaves on the fly as their party uncovers the dark history of Barovia.

---

## Features

- **Immersive Book Interface:** Parchment-like styling with gradual ink reveal mechanics.
- **DM Authoring Dashboard:** Create, edit, conceal, or delete custom chapter leaves tailored to your specific campaign state.
- **Public Leaf Sharing & Live Preview:** Publish unique URLs (`/u/[user_id]/[slug]`) for your players. DMs get a dedicated preview mode for hidden leaves.
- **Markdown-Powered Narrative:** Full support for Markdown formatting (headings, lists, blockquotes, code blocks) without breaking book-layout page splitting.
- **Secure Data Persistence:** Firebase Authentication (Google OAuth + Email/Password) backed by Firestore security rules.

---

## Live Demo

Try out the latest alpha deployment: **[living-tome-alpha.vercel.app](https://living-tome-alpha.vercel.app/)**

---

## Tech Stack

- **Framework:** Next.js 16 (Pages Router) + React 19
- **Styling & Motion:** Tailwind CSS 4, Motion for React
- **Database & Auth:** Firebase Auth, Firestore
- **State Management:** Jotai
- **Testing:** Jest
- **Language:** TypeScript

---

## Local Development Setup

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Firebase Project**: A Firebase project with **Authentication** (Email/Password & Google) and **Firestore Database** enabled.

### 1. Clone the Repository

```bash
git clone https://github.com/leecarin/living-tome.git
cd living-tome
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your Environment

Create a `.env.local` file in the root directory and add your Firebase web app configuration:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Continuous Integration and Automated Testing

This repository uses **GitHub Actions** to automatically validate code quality on all pushes and pull requests targeting the `main` branch.

### Automated Checks (`Run Unit Tests and Lint`)

Every PR and commit automatically triggers a CI pipeline that runs:

1. Type Checking: `npx tsc --noEmit` to ensure Typescript compilation
2. Linting: `npm run lint` with ESLint
3. Unit Tests: `npm test` executes Jest test suites.

### Deployment Protections

- Pull Requests: All CI status checks _must_ pass before branches can be merged into `main`.
- Production Deployments: Vercel automatically deploys updates to production upon successful merge.

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Runs the compiled production build locally.
- `npm test`: Executes the Jest unit test suite.
- `npm run lint`: Runs ESLint to check for code formatting issues.

---

## Project Architecture

```text
src/
├── components/          # Reusable UI, Tome page layout, & Markdown components
├── hooks/               # Custom hooks (e.g., passage reveal timing mechanics)
├── lib/
│   ├── firebase/        # Client initialization, Auth wrappers, & Firestore CRUD
├── pages/
│   ├── index.tsx        # Animated landing page / Tome cover
│   ├── auth/            # Sign-in & registration flow
│   ├── admin/           # DM dashboard for managing custom chapters
│   └── u/[user_id]/     # Public & Preview chapter routes
└── store/               # Global state atoms (Jotai)
```

---

## Contributing

Contributions, feedback, and feature requests are welcome! If you find a bug or have an idea to make running _The Interactive Tome of Strahd_ even better:

1. Open an issue describing the bug or feature request.

2. Fork the repository and create a feature branch (git checkout -b feature/amazing-feature).

3. Commit your changes (git commit -m 'Add amazing feature').

4. Push to the branch (git push origin feature/amazing-feature).

5. Open a Pull Request.

---

## License

Distributed under the MIT License. See LICENSE.md for more information.

---

## Acknowledgements

The _[The Interactive Tome of Strahd](https://www.dmsguild.com/en/product/301867/the-interactive-tome-of-strahd)_ module created by The Aciduous Adventurer.

Wizards of the Coast for the _Curse of Strahd_ setting.
