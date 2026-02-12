# Deployment Guide for School Management System

This guide outlines the steps to deploy your MERN stack application to production using **Render** for the backend and **Vercel** for the frontend.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **MongoDB Atlas**: Have your MongoDB connection string ready.

---

## 1. Backend Deployment (Render)

1.  Log in to [Render](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `school-management-api` (or similar)
    *   **Root Directory**: `server` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Add these in the "Environment" tab):
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A strong secret key for authentication.
    *   `PORT`: Render sets this automatically, but ensure your code uses `process.env.PORT` (We have done this).
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. **Copy the URL** provided by Render (e.g., `https://school-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `client` (Important! Click "Edit" next to Root Directory and select `client`).
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste the **Render Backend URL** you copied earlier (e.g., `https://school-api.onrender.com`).
        *   *Note: Do not add a trailing slash `/`.*
6.  Click **Deploy**.

---

## 3. Final Checks

1.  Open your Vercel App URL.
2.  Try logging in.
    *   If you see "Network Error", check if the Backend URL in Vercel environment variables is correct.
    *   Check the Network tab in browser developer tools to see if requests are going to the correct API URL.
3.  Test main features (Attendance, results, etc.).

## Troubleshooting

*   **CORS Issues**: If you see CORS errors in the browser console, ensure the backend allows requests from your Vercel domain. Currently, the backend allows all origins (`cors()`), which is fine for initial deployment.
*   **404 on Refresh**: We added a `vercel.json` file in the client folder to handle routing, so refreshing pages should work correctly.
