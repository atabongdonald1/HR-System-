# NEXA-HR Deployment Guide (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com).

## Deployment Steps

1.  **Connect to GitHub/GitLab/Bitbucket**: Push your code to a repository and connect it to Vercel.
2.  **Configure Environment Variables**:
    *   In the Vercel project settings, add the following environment variable:
        *   `GEMINI_API_KEY`: Your Google Gemini API key.
3.  **Build Settings**:
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Deploy**: Click deploy and your app will be live!

## SPA Routing

A `vercel.json` file is included to handle Single Page Application (SPA) routing, ensuring that all deep links correctly redirect to `index.html`.
