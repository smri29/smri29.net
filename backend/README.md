# Backend

This backend powers the portfolio website, admin dashboard, contact workflow, and the `RAI` chatbot.

## What It Handles

- admin authentication with JWT
- public portfolio data APIs
- protected admin CRUD APIs
- contact form delivery and inbox storage
- AI chat endpoint
- Cloudinary project image handling
- MongoDB persistence for all portfolio sections

## Main Stack

- Node.js
- Express
- Mongoose
- JWT
- Nodemailer
- Google Gemini
- Cloudinary

## Important Files

```text
backend/
|-- config/
|   |-- cloudinary.js
|   `-- db.js
|-- controllers/
|   |-- aiController.js
|   |-- authController.js
|   `-- dataController.js
|-- middleware/
|   `-- authMiddleware.js
|-- models/
|-- routes/
|   |-- authRoutes.js
|   `-- dataRoutes.js
|-- .env.sample
`-- server.js
```

## Environment Variables

Use [.env.sample](.env.sample) as the template.

```env
PORT=
MONGO_URI=
GEMINI_API_KEY=

EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
EMAIL_RECEIVER=

FRONTEND_URL=

ADMIN_EMAIL=
ADMIN_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local Development

```bash
cd backend
npm install
copy .env.sample .env
npm run dev
```

The API starts from `server.js`.

## Available Scripts

```bash
npm run dev
npm start
```

## Backend Responsibilities

### Authentication

- admin login
- JWT token generation
- protected admin routes

### Content Management

- hero content
- introduction content
- research publications
- technical projects
- work experience
- education
- professional certificates
- skills
- hobbies and interests
- AI knowledge settings
- recruiter messages

### AI

The chat endpoint builds its knowledge from admin-managed data instead of relying on hardcoded profile text. This allows portfolio updates to be reflected in the assistant without editing source code.

## Deployment

This backend is intended to run on Render. Make sure the environment variables from `.env.sample` are configured in the Render dashboard.
