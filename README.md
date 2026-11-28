# Fundoo Notes — Frontend

A modern, responsive single-page application (SPA) for creating, organising, remembering and sharing notes. This repository contains the **frontend only**; it talks to a separate REST API running at `http://localhost:8080`.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Authentication](#authentication)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling and Design](#styling-and-design)
- [Testing](#testing)
- [Building and Deployment](#building-and-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

Fundoo Notes is a Google Keep-inspired note management application. Users can register and verify their email, log in securely, create and edit notes, pin important ones, archive or trash notes, organise them with labels, attach files, and set reminders with IST-aware time handling.

The app is built with React 19 and Vite, uses React Router for navigation, Axios for HTTP calls, and Vitest + React Testing Library for tests. It has no backend of its own — all data is fetched from and written to a compatible Fundoo REST API.

---

## Features

### Authentication and account flows

- **Register** with first name, email and password.
- **Login** with a token returned by the backend.
- **Email verification** via a token-bearing link (`/verify-email?token=...`).
- **Resend verification email** from the login page when the error indicates verification is pending.
- **Forgot password** request flow with email prefill from router state.
- **Reset password** via `/reset-password?token=...` with client-side confirmation validation.
- **Logout** that calls the backend, clears the local token and redirects to `/login`.

### Notes

- Create notes with a required title and optional description.
- Edit notes inline from the note card.
- Pin / unpin, archive / unarchive, move to trash, restore from trash and permanently delete.
- Client-side search across note title and description.
- Filter by **All**, **Pinned** and **Others** on the dashboard.
- Filter by label from the sidebar.
- Pinned notes are sorted to the top.
- Add or remove labels on individual notes.

### Labels

- Create, rename and delete labels from the sidebar.
- Validation: non-empty name, maximum 50 characters, case-insensitive duplicate rejection.
- Server errors are surfaced to the user.
- Per-note label picker on every note card.

### Reminders

- Create reminders only for active (non-archived, non-trashed) notes.
- Edit and delete existing reminders.
- Notes that already have a reminder are excluded from the picker.
- Rejects past reminder times on the client side.
- Reminder times are converted and displayed in Asia/Kolkata (IST); the page refreshes reminders every 30 seconds.

### Attachments

- Upload files as multipart form data (field name `file`).
- Allowed types: PNG, JPEG, GIF, PDF, TXT, DOC, DOCX, XLS, XLSX.
- Maximum file size: 10 MB.
- View attachments in a new tab via a blob URL, and download via a temporary anchor.

### Profile

- Read-only profile page showing initials, name and email.
- Loading, error-with-retry and refresh states.

### UX details

- Persistent sidebar with responsive mobile drawer and scrim.
- Global search bar shared through router outlet context.
- Toast notifications for user feedback.
- Reusable empty and loading states.
- Hand-authored inline SVG icon registry — no external icon dependency.
- Responsive breakpoints around 900px, 880px and 600px.
- `prefers-reduced-motion` support.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Language | JavaScript (ESM), JSX |
| UI library | React 19 |
| Build tool / dev server | Vite 8 |
| React plugin | `@vitejs/plugin-react` 6 |
| Routing | `react-router-dom` 7 |
| HTTP client | Axios 1 |
| Tests | Vitest 4, React Testing Library 16, `user-event` 14, Jest DOM 6, jsdom 25 |
| Linting | ESLint 10 flat config (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) |
| Styling | Plain global CSS with custom properties |
| Package manager | npm (lockfile v3) |

There is no TypeScript source and no `tsconfig.json`; `@types/react` and `@types/react-dom` are installed but currently unused.

---

## Prerequisites

- **Node.js 22.13+ or 24+** — the installed toolchain requires a modern runtime:
  - Vite 8 / plugin-react 6: `^20.19.0 || >=22.12.0`
  - React Router 7: `>=20`
  - ESLint 10: `^20.19.0 || ^22.13.0 || >=24`
- **npm** bundled with Node.
- A **compatible Fundoo backend REST API** running at `http://localhost:8080` for any real data operations. Tests mock services and do not need a live backend.

---

## Getting Started

```powershell
# 1. Install dependencies from the lockfile
npm ci

# 2. Start the Vite dev server (default: http://localhost:5173)
npm run dev
```

If you do not want a lockfile-based install, `npm install` works as well.

Open the URL printed in the terminal, then register or log in. If the backend is not running, pages will load but API calls will fail.

---

## Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `vite` | Start the development server with HMR. |
| `npm run build` | `vite build` | Create an optimised production bundle in `dist/`. |
| `npm run preview` | `vite preview` | Serve the production build locally (normally port 4173). |
| `npm test` | `vitest run` | Run the full test suite once, in non-watch mode. |
| `npm run lint` | `eslint .` | Lint all supported files with the flat ESLint config. |

Watch mode is not defined as a script; run `npx vitest` directly when needed.

---

## Project Structure

```text
fundoo-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                 # Vite starter images (currently unused)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ActionButton.jsx
│   │   │   ├── AuthHero.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── PageHeader.jsx
│   │   ├── Navbar.jsx          # Sidebar: navigation, labels, logout
│   │   ├── SearchBar.jsx       # Controlled search input
│   │   ├── ProtectedRoute.jsx  # Token-based route guard
│   │   └── NoteCard.jsx        # Note display and all note actions
│   ├── layouts/
│   │   └── AppLayout.jsx       # Sidebar, topbar, outlet context, toast, labels
│   ├── pages/
│   │   ├── RegisterPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ReminderPage.jsx
│   │   ├── ArchivePage.jsx
│   │   ├── TrashPage.jsx
│   │   ├── AttachmentPage.jsx
│   │   └── ProfilePage.jsx
│   ├── router/
│   │   └── AppRoutes.jsx       # Route table
│   ├── services/               # One Axios-backed module per domain
│   │   ├── authService.js
│   │   ├── noteService.js
│   │   ├── labelService.js
│   │   ├── reminderService.js
│   │   ├── attachmentService.js
│   │   └── profileService.js
│   ├── test/
│   │   └── setup.js            # RTL cleanup + jest-dom matchers
│   ├── utils/
│   │   ├── apiClient.js        # Axios instance and interceptors
│   │   ├── token.js            # localStorage token helpers
│   │   └── reminderTime.js     # IST conversion/formatting helpers
│   ├── App.jsx
│   ├── main.jsx                # React root + StrictMode + BrowserRouter
│   ├── index.css               # Main global stylesheet
│   └── App.css                 # Unused Vite starter CSS
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## Routing

Defined in `src/router/AppRoutes.jsx`.

### Public routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/register` | `RegisterPage` | Create a new account. |
| `/login` | `LoginPage` | Sign in and store the token. |
| `/forgot-password` | `ForgotPasswordPage` | Request a password reset email. |
| `/reset-password?token=...` | `ResetPasswordPage` | Set a new password using the emailed token. |
| `/verify-email?token=...` | `VerifyEmailPage` | Verify email once on mount. |

### Protected routes

Wrapped in `ProtectedRoute`, then `AppLayout`:

| Route | Page | Purpose |
| --- | --- | --- |
| `/dashboard` | `DashboardPage` | Active notes, composer, search and filters. |
| `/reminders` | `ReminderPage` | List, create, edit and delete reminders. |
| `/archive` | `ArchivePage` | Archived notes. |
| `/trash` | `TrashPage` | Restore or permanently delete trashed notes. |
| `/attachments` | `AttachmentPage` | Upload, list, view and download files. |
| `/profile` | `ProfilePage` | Read-only profile details. |

Any unknown path (including `/`) redirects to `/register` with `<Navigate to="/register" replace />`.

`AppLayout` shares the following via `<Outlet context={...} />` and `useOutletContext()`: `selectedLabel`, `setSelectedLabel`, `labels`, `refreshLabels`, `searchQuery` and `notify`.

---

## Authentication

- The JWT/token is stored in browser `localStorage` under the key `"token"` (`src/utils/token.js`).
- `apiClient` attaches `Authorization: Bearer <token>` to every request when a token exists.
- `ProtectedRoute` redirects to `/login` when no token is present.
- On a `401` response for any request other than `/api/users/login`, the token is removed and the browser is redirected to `/login`.
- Logout calls `POST /api/auth/logout`, clears the token regardless of the backend result, and navigates to `/login`.
- There is no refresh-token flow, role model or auth context provider.

---

## State Management

No Redux, Zustand or custom context provider is used.

- **Local state** (`useState`) drives forms, lists, loading/error flags and busy indicators inside each page.
- **Shared layout state** lives in `AppLayout` and is passed to pages through React Router outlet context.
- **Server state** is fetched on page mount and re-fetched after mutations; there is no caching layer such as React Query or SWR.
- `DashboardPage`, `ArchivePage` and `TrashPage` all fetch the full note list and filter locally by `archived`/`trashed` flags.

---

## API Integration

All requests go through the shared Axios instance in `src/utils/apiClient.js`:

- **Base URL:** `http://localhost:8080` (hardcoded)
- **Default header:** `Content-Type: application/json`
- **Auth header:** injected by request interceptor
- **Errors:** re-thrown so each page can render a user-facing message

### Endpoints

#### Auth — `src/services/authService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| POST | `/api/users/register` | `registerUser` |
| POST | `/api/users/login` | `loginUser` |
| POST | `/api/auth/verify-email/resend` | `resendVerificationEmail` |
| POST | `/api/auth/verify-email` | `verifyEmail` |
| POST | `/api/auth/forgot-password` | `requestPasswordReset` |
| POST | `/api/auth/reset-password` | `resetPassword` |
| POST | `/api/auth/logout` | `logoutUser` |

#### Notes — `src/services/noteService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| GET | `/api/notes` | `getAllNotes` |
| POST | `/api/notes` | `createNote` |
| PATCH | `/api/notes/{noteId}/pin` | `togglePin` |
| PATCH | `/api/notes/{noteId}/archive` | `toggleArchive` |
| PATCH | `/api/notes/{noteId}/trash` | `toggleTrash` |
| PUT | `/api/notes/{noteId}` | `updateNote` |
| PATCH | `/api/notes/{noteId}/restore` | `restoreNote` |
| DELETE | `/api/notes/{noteId}` | `permanentlyDeleteNote` |

#### Labels — `src/services/labelService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| GET | `/api/labels` | `getAllLabels` |
| POST | `/api/labels` | `createLabel` |
| PUT | `/api/labels/{labelId}` | `updateLabel` |
| DELETE | `/api/labels/{labelId}` | `deleteLabel` |
| POST | `/api/labels/{labelId}/notes/{noteId}` | `assignLabelToNote` |
| DELETE | `/api/labels/{labelId}/notes/{noteId}` | `removeLabelFromNote` |

#### Reminders — `src/services/reminderService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| GET | `/api/reminders` | `getAllReminders` |
| POST | `/api/reminders` | `createReminder` |
| PUT | `/api/reminders/{reminderId}` | `updateReminder` |
| DELETE | `/api/reminders/{reminderId}` | `deleteReminder` |

#### Attachments — `src/services/attachmentService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| POST | `/api/attachments/upload` | `uploadAttachment` (multipart, field `file`) |
| GET | `/api/attachments` | `getAllAttachments` |
| GET | `/api/attachments/{attachmentId}/view` | `viewAttachment` (blob) |
| GET | `/api/attachments/{attachmentId}/download` | `downloadAttachment` (blob) |

#### Profile — `src/services/profileService.js`

| Method | Endpoint | Function |
| --- | --- | --- |
| GET | `/api/users/profile` | `getProfile` |

### Expected data shapes

```js
Note       = { id, title, description, pinned, archived, trashed, labels }
Label      = { id, name }
Reminder   = { id, noteId, noteTitle, reminderTime }
Attachment = { id, originalFileName, contentType, fileSize, uploadedAt }
Profile    = { firstName, email }
LoginResponse = { token, ... }
```

---

## Styling and Design

- Single global stylesheet: `src/index.css` (~1,500 lines).
- Design tokens in `:root`: colours, shadows, radii, sidebar width, sans-serif font stack.
- Warm light palette (orange/brown primary, cream surfaces, muted text).
- Utility-style class names: `.btn`, `.btn-primary`, `.input`, `.note-card`, `.sidebar`, `.topbar`, `.page-content`, `.toast`, etc.
- Responsive layouts with a collapsible mobile sidebar (`.sidebar.open`, `.scrim.visible`).
- Motion is disabled for users with `prefers-reduced-motion`.
- Icons are local inline SVGs from `src/components/ui/Icon.jsx`.
- `src/App.css` is leftover Vite starter CSS and is not imported.

---

## Testing

Tests live next to the code they cover and use Vitest with jsdom.

| Test file | Coverage |
| --- | --- |
| `src/components/NoteCardReminder.test.jsx` | IST reminder submission, past-time rejection |
| `src/layouts/LabelEditFlow.test.jsx` | Label rename, duplicate validation, server error, create |
| `src/pages/AuthFlow.test.jsx` | Forgot password, reset token validation, reset, email verification, logout |
| `src/pages/NoteLifecycleFlow.test.jsx` | Note update, restore, permanent delete |
| `src/pages/AttachmentFlow.test.jsx` | Upload txt/xlsx, unsupported type rejection, view, download |
| `src/pages/ReminderFlow.test.jsx` | List, update, delete, past-time rejection, create |
| `src/pages/ProfilePage.test.jsx` | Profile load success and API failure state |

```powershell
npm test
```

Service modules are mocked with `vi.mock`, so tests make no real HTTP requests. `src/test/setup.js` runs React Testing Library `cleanup()` after each test and registers `@testing-library/jest-dom/vitest`.

---

## Building and Deployment

```powershell
npm run build
```

The optimised output is written to `dist/` (gitignored). Preview it locally with:

```powershell
npm run preview
```

For production deployment:

1. Build with `npm run build`.
2. Serve the `dist/` directory with any static host (Nginx, Netlify, Vercel, S3, etc.).
3. Configure SPA fallback routing so unknown paths serve `index.html`.
4. Update the API base URL in `src/utils/apiClient.js` (or add an environment-variable based config) to point at your deployed backend.
5. Ensure the backend allows CORS requests from your frontend origin.

> **Note:** The app currently uses browser history routing (`BrowserRouter`) and a hardcoded API URL, so both the SPA fallback and the API URL must be handled at deployment time.


## Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| API calls fail with network errors | The backend is not running at `http://localhost:8080`. Start it or update `baseURL` in `src/utils/apiClient.js`. |
| You are redirected to `/login` unexpectedly | A non-login request returned `401`; the token was cleared. Log in again and check token validity. |
| `npm run dev` fails immediately | Node version is too old. Use Node 22.13+ or 24+. |
| Reminder time rejected as invalid | Past times are blocked client-side; reminders use IST (Asia/Kolkata). |
| File upload rejected | Only PNG/JPEG/GIF/PDF/TXT/DOC/DOCX/XLS/XLSX up to 10 MB are allowed. |
| Blank page on a deep link in production | Configure your static host to fall back to `index.html` for all routes. |
| Lint or test failures after changes | Run `npm run lint` and `npm test`; mock service modules in tests instead of calling the real API. |
