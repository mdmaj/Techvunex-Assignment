# Technuvex

Technuvex is a product storefront with:

- React and Vite frontend
- Express and MongoDB backend
- User login through email OTP
- Separate admin email/password login
- Admin-only product publishing
- Public product listing
- Gmail SMTP support for OTP delivery

## Project Structure

```text
Technuvex/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- Gmail account with 2-Step Verification and an App Password for OTP email

## Local Setup

Clone the repository and install dependencies:

```bash
git clone <your-repository-url>
cd Technuvex

cd backend
npm install

cd ../frontend
npm install
```

## Backend Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret

# Admin login only
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=replace-with-admin-password

# Gmail sender for user OTP emails
EMAIL_USER=sender@example.com
EMAIL_PASS=replace-with-a-16-character-gmail-app-password
```

### Environment Variable Rules

- `ADMIN_EMAIL` and `ADMIN_PASS` are used only for admin login.
- `EMAIL_USER` and `EMAIL_PASS` are used only by Nodemailer to send OTP emails.
- `EMAIL_PASS` must be a Gmail App Password, not the normal Gmail password.
- User emails are supplied at runtime and are used as the OTP recipient.
- Never commit `.env` files or expose passwords, database credentials, JWT secrets, or App Passwords.

## Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=admin@example.com
```

`VITE_` values are bundled into the browser. Never put admin passwords or private secrets in frontend environment variables.

## Run Locally

Start the backend in one terminal:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Authentication Flows

### User Login

1. Select **User login**.
2. Enter any valid user email.
3. Click **Send me a code**.
4. The backend sends the OTP to that entered email.
5. Enter the OTP.
6. The user is redirected to `/products`.

A user record is created automatically in MongoDB after successful OTP verification.

### Admin Login

1. Select **Admin login**.
2. Enter `ADMIN_EMAIL`.
3. Enter `ADMIN_PASS`.
4. The backend returns a JWT.
5. The admin is redirected to `/admin`.

The frontend never receives or displays the admin password automatically.

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Send User OTP

```http
POST /auth/send-otp
Content-Type: application/json
```

```json
{
  "email": "user@example.com"
}
```

### Verify User OTP

```http
POST /auth/verify-otp
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Admin Login

```http
POST /auth/admin-login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "admin-password"
}
```

### Get Products

```http
GET /products
```

This endpoint is public.

### Create Product

```http
POST /products
Authorization: Bearer <admin-jwt>
Content-Type: application/json
```

```json
{
  "name": "Ceramic Coffee Set",
  "description": "Minimal ceramic coffee set",
  "price": 1999,
  "image": "https://example.com/product.jpg"
}
```

Only an authenticated admin can create products.

## Product Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Product name |
| `description` | string | No | Product description |
| `price` | number | Yes | Non-negative product price |
| `image` | string | Yes | Product image URL |

## Deployment

### Current Production URLs

```text
Frontend: https://techvunex-assignment.vercel.app
Backend:  https://techvunex-api.onrender.com
API:      https://techvunex-api.onrender.com/api
```

### Backend on Render

Create a Render Web Service connected to the repository:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add these Render environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=<production-mongodb-uri>
JWT_SECRET=<production-random-secret>
ADMIN_EMAIL=<admin-email>
ADMIN_PASS=<admin-password>
EMAIL_USER=<gmail-sender>
EMAIL_PASS=<gmail-app-password>
```

Render provides its own `PORT`; the backend already reads `process.env.PORT`.

The deployed backend URL is:

```text
https://techvunex-api.onrender.com
```

Test the public endpoint:

```text
https://techvunex-api.onrender.com/api/products
```

### Frontend on Vercel

Create a Vercel project connected to the repository:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add this Vercel environment variable:

```env
VITE_API_URL=https://techvunex-api.onrender.com/api
```

Redeploy after changing environment variables.

The backend allows requests from:

```text
http://localhost:5173
https://techvunex-assignment.vercel.app
```

If the Vercel domain changes, update the allowed origin in `backend/server.js` and redeploy Render.

For React Router direct URLs, add `frontend/vercel.json` if needed:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Validation Commands

Frontend build and lint:

```bash
cd frontend
npm run build
npm run lint
```

Backend syntax checks:

```bash
cd backend
node --check server.js
node --check controllers/authControllers.js
node --check controllers/productController.js
```

## Troubleshooting

### Development OTP appears instead of email

Check that the backend has both values:

```env
EMAIL_USER=sender@example.com
EMAIL_PASS=gmail-app-password
```

If Gmail returns `535 BadCredentials`, create a new Gmail App Password and restart the backend.

### Admin login returns 401

Check that the submitted values exactly match:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=admin-password
```

Restart the backend after changing `.env` because environment variables are loaded at startup.

### Products do not load after deployment

Check:

1. `VITE_API_URL` points to the Render API URL and includes `/api`.
2. The Render service is running.
3. MongoDB Atlas allows the Render service to connect.
4. The browser is not using an old Vercel deployment.

### Render service is slow on the first request

Free Render services may sleep after inactivity. The first request can take several seconds while the service wakes up.

## Security Checklist

- Rotate any credentials that have been exposed.
- Use a unique production `JWT_SECRET`.
- Use a Gmail App Password for SMTP.
- Keep `.env` files out of Git.
- Never add `ADMIN_PASS`, `EMAIL_PASS`, or `MONGO_URI` to frontend variables.
- Restrict MongoDB Atlas network access for production where practical.
