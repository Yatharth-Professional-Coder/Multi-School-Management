# EduSphere - Multi-School Management System

## Getting Started

### 1. Environment Setup
Ensure you have the following installed:
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)

### 2. Configuration
The `server/.env` file has been created with default values.
Update `MONGODB_URI` in `server/.env` if you are using a cloud database.

### 3. Installation
Run the following command in the root directory to install dependencies for both client and server:
```bash
npm install
cd client && npm install
cd ../server && npm install
```
*(I have already performed the installation steps for you)*

### 4. Running the App
To start both the Backend (Port 5000) and Frontend (Port 5173) concurrently:

```bash
npm run dev
```

## Features Implemented (Phase 1)
- **Backend:** Express Server, MongoDB Connection, User Model, Authentication (Login/Register/JWT).
- **Frontend:** React + Vite, Context API for Auth, Login/Register Pages.
- **UI:** Global CSS Variables, Dark Mode, Glassmorphism.

## Next Steps (Phase 2)
- Implement Super Admin Dashboard (Create Schools).
- Implement Admin Dashboard (Add Teachers/Students).
