# Frontend

This frontend is the public portfolio and admin dashboard client for Shah Mohammad Rizvi.

Live site: [https://smri29net.vercel.app/](https://smri29net.vercel.app/)

## Frontend Features

- polished portfolio landing page
- section-based storytelling for hero, intro, experience, projects, research, skills, certificates, education, hobbies, and contact
- protected admin dashboard for full portfolio management
- dedicated certifications page
- responsive navigation and layout
- subtle motion using Framer Motion
- AI chat widget branded as `RAI`

## Screenshots

### Hero Section
![Portfolio hero](public/ss/portfolio%20first%20section.png)

### Introduction Section
![Portfolio introduction](public/ss/portfolio%20intro%20section.png)

### Contact Section
![Portfolio contact](public/ss/portfolio%20contact%20section.png)

## Tech Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router
- React Toastify

## Project Structure

```text
frontend/
|-- public/
|   `-- ss/
|-- src/
|   |-- api/
|   |-- assets/
|   |-- components/
|   `-- pages/
|-- package.json
`-- README.md
```

## Local Development

```bash
cd frontend
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment / API

The frontend uses the shared Axios client in `src/api/axios.js` to communicate with the backend API.

For local development, make sure the backend is running and that the backend `FRONTEND_URL` matches your local frontend URL.

## Deployment

This frontend is intended to run on Vercel.
