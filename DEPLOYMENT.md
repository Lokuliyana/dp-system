# Deployment Guide

This project is configured to be flexible and compatible with Vercel for both Frontend and Backend.

## Backend (`dp_be`)

The backend is an Express application adapted for Vercel Serverless Functions.

### Deployment Steps:
1.  **Import Project**: In Vercel, import the `dp_be` directory as a new project.
2.  **Framework Preset**: Select "Other" (or Vercel will auto-detect).
3.  **Environment Variables**: Set the following variables in Vercel Project Settings:
    *   `MONGO_URI`: Your MongoDB connection string.
    *   `JWT_ACCESS_SECRET`: Secret for access tokens.
    *   `JWT_REFRESH_SECRET`: Secret for refresh tokens.
    *   `CORS_ORIGINS`: The URL of your deployed frontend (e.g., `https://my-frontend.vercel.app`).
    *   `API_BASE_URL`: The URL of your deployed backend (e.g., `https://my-backend.vercel.app`).
    *   `NODE_ENV`: Set to `production`.

### Key Changes Made:
*   Added `api/index.js` as the entry point for Vercel.
*   Added `vercel.json` to route requests to the entry point.
*   Updated `src/config/env.js` and `src/config/cors.js` to respect environment variables for Port and CORS.

## Frontend (`dp_fe`)

The frontend is a Next.js application, which is natively supported by Vercel.

### Deployment Steps:
1.  **Import Project**: In Vercel, import the `dp_fe` directory as a new project.
2.  **Framework Preset**: Vercel will automatically detect Next.js.
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_BASE_URL`: The URL of your deployed backend (e.g., `https://my-backend.vercel.app/api/v1`).

## Local Development

You can still run the project locally using `.env` files.
*   **Backend**: `dp_be/.env` (ensure `PORT` is set).
*   **Frontend**: `dp_fe/.env.local` (ensure `NEXT_PUBLIC_API_BASE_URL` points to localhost).
