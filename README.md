# Interview Board - Frontend (UI)

This directory contains the React frontend for the Interview Board application. It provides the user interface for managing AI agent templates, taking simulated interviews, viewing past runs, and seeing certificates of completion.

## Technology Stack

- **Framework**: React 19 with [Vite](https://vitejs.dev/)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing**: React Router DOM
- **Authentication & Backend Services**: Supabase (`@supabase/supabase-js`)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Styling**: CSS (with modern aesthetics and responsivenes)

## Prerequisites

- **Node.js**: >= 18
- **npm** (comes with Node.js)

## Getting Started

### 1. Install Dependencies

Navigate to the `ui` directory and install the necessary npm packages:

```bash
cd ui
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the `ui` directory by copying the provided sample:

```bash
cp .env.sample .env.local
```

You will need to configure the following environment variables:

```env
# Supabase credentials (for authentication and some backend services if used directly)
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY

# URL pointing to your local or remote FastAPI backend
VITE_API_BASE_URL=http://localhost:8080

# Gemini API Key (if relying on client-side AI generation for specific features)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note**: The `.env.local` file is excluded from git tracking. Ensure you never commit your actual API keys or secrets.

### 3. Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite in your terminal).

## Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will generate static assets in the `dist` directory. This directory can be served by any static file hosting service, Nginx, or via the included simple Node server.

To preview the production build locally (which uses the `serve` dependency mapped to the `start` script handling the `$PORT` variable):

```bash
npm run preview
```

## Project Structure

- `src/components/`: Reusable React components (e.g., buttons, cards, headers).
- `src/pages/`: Top-level page components mapping to routes (e.g., Home, TemplateList, TemplateEditor, AgentRuns).
- `src/services/`: Services for making API requests to the backend or external services (e.g., `LLMService.ts`, `api.ts`).
- `src/store/`: Redux store configuration and slices.
- `src/utils/`: Helper functions and utility constants.
- `src/App.tsx`: Main application component, including routing definitions and global providers.

## Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles TypeScript and creates an optimized production build.
- `npm run preview`: Locally previews the production build generated in the `dist` folder.
- `npm run start`: Starts the `serve` server targeting the `dist` folder (often used in basic deployment environments).
