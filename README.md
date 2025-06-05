# VLM Run Predictions Viewer - Nuxt Edition

A Nuxt.js application that securely fetches predictions from VLM Run API server-side and displays them with YouTube videos and JSON data.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your VLM Run API key:
   ```
   NUXT_VLMRUN_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

## Features

- Server-side API calls to protect your VLM Run API key
- Fetches predictions for multiple video IDs
- Two-column responsive layout
- YouTube video embedding
- Interactive JSON data display
- Video selection navigation

## Architecture

- **Nuxt 3** - Full-stack Vue framework
- **Server API Routes** - Secure backend API calls using vlmrun Node SDK
- **Nuxt UI** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling

## API Routes

- `POST /api/predictions/batch` - Fetch multiple predictions by IDs
- `GET /api/predictions/[id]` - Fetch a single prediction by ID

## Security

Your VLM Run API key is stored securely on the server and never exposed to the client. All API calls to VLM Run are made from the Nuxt server.
