# Project: Frontend Academia

## Project Overview

This is a single-page application (SPA) for managing an academy, built with React, TypeScript, and Vite. It features a modular architecture, simulated authentication, and a comprehensive set of components for academic and financial management. The project uses Tailwind CSS for styling, Zustand for state management, React Router for navigation, and TanStack Query for data fetching. A mock backend is provided using Mock Service Worker (MSW) for development and testing.

## Building and Running

### Prerequisites

*   Node.js 18+
*   npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Copy the environment variables file:
    ```bash
    cp .env.example .env
    ```
    Update `VITE_API_URL` in `.env` if the backend is not running on `http://localhost:8080/api/v1`.

### Key Commands

*   **`npm run dev`**: Starts the development server with Hot Module Replacement (HMR).
*   **`npm run build`**: Compiles the TypeScript code and builds the project for production.
*   **`npm run preview`**: Serves the production build locally for verification.
*   **`npm run lint`**: Lints the codebase using ESLint.

## Development Conventions

### Architecture

*   **`src/api`**: Contains the Axios instance and API client for backend communication.
*   **`src/components`**: Reusable UI components, including forms and layouts.
*   **`src/hooks`**: Custom hooks for data fetching with TanStack Query.
*   **`src/pages`**: Application pages, organized by feature (e.g., `alumnos`, `pagos`).
*   **`src/router`**: Defines the application's routing structure, including private and role-based routes.
*   **`src/services`**: Functions that encapsulate the logic for making API calls.
*   **`src/store`**: Global state management with Zustand, including the authentication state.
*   **`src/validation`**: Zod schemas for form validation.

### Authentication and Authorization

*   Authentication is simulated. A user's role is determined by their email address:
    *   If the email contains "admin", the user is assigned the `admin` role.
    *   Otherwise, the user is assigned the `user` role.
*   The `PrivateRoute` component protects routes that require authentication.
*   The `RoleRoute` component restricts access to routes based on user roles.

### API and Data Fetching

*   The `src/api/client.ts` file provides a typed HTTP client for interacting with the backend API.
*   Data fetching is managed using TanStack Query. Custom hooks in `src/hooks` wrap the API calls.
*   Mock Service Worker (MSW) is used to mock the backend API for development. Mock handlers are defined in the `mocks` directory.
