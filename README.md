# 11 o'clock

11 o'clock is a unified professional workspace designed to simplify cross-platform content distribution. The application allows users to draft, optimize, and publish posts to social media platforms (currently supporting Twitter/X and LinkedIn) from a single secure console.

---

## Repository Structure

This repository is structured as a monorepo containing both the frontend client and the backend server:

*   `/client`: Frontend React application built with Vite and styled using Tailwind CSS.
*   `/backend`: REST API built with Node.js, Express, and MongoDB.

---

## Technical Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **Authentication**: Clerk
*   **Media Uploads**: Supabase Storage

### Backend
*   **Runtime**: Node.js (Express)
*   **Database**: MongoDB (Mongoose)
*   **Payment Gateway**: Razorpay
*   **Security**: Helmet, CORS, Rate Limiting

---

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   MongoDB Instance (Local or MongoDB Atlas)

---

### Installation & Local Run

#### 1. Backend Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/backend` folder and populate it with the required environment variables.
4. Start the development server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Client Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/client` folder and populate it with the required environment variables.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Environment Variables

### Backend Configuration (`/backend/.env`)
The backend requires the following environment variables:
*   `PORT`: The port number the server runs on (defaults to 5000).
*   `MONGO_URI`: Your MongoDB database connection string.
*   `CLERK_SECRET_KEY`: Clerk private secret key for API requests.
*   `RAZORPAY_KEY_ID`: Razorpay public API key.
*   `RAZORPAY_KEY_SECRET`: Razorpay private API secret.
*   `RAZORPAY_WEBHOOK_SECRET`: Secret key to verify Razorpay webhook signatures.
*   `FRONTEND_URL`: URL of the frontend application (for CORS configuration).
*   `ENCRYPTION_KEY`: A 64-character hexadecimal key used to encrypt connection credentials at rest.
*   `TWITTER_CLIENT_ID`: Twitter/X OAuth 2.0 application client ID.
*   `TWITTER_CLIENT_SECRET`: Twitter/X OAuth 2.0 application client secret.

### Frontend Configuration (`/client/.env`)
The frontend requires the following environment variables:
*   `VITE_API_URL`: The URL of the backend API (e.g., `http://localhost:5000`).
*   `VITE_CLERK_PUBLISHABLE_KEY`: Clerk public publishable key.
*   `VITE_RAZORPAY_KEY_ID`: Razorpay public API key.
