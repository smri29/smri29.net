# 🚀 Shah Mohammad Rizvi | Portfolio (smri29.net)

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-000000?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> The official personal portfolio website of **Shah Mohammad Rizvi**. A modern, glassmorphic single-page application built to showcase research, projects, and leadership roles.

## 🌟 Features

### 🎨 Public Interface
- **Glassmorphic UI:** A dark-themed, premium aesthetic using Tailwind CSS and Framer Motion.
- **Single Page Architecture:** Smooth scrolling navigation for Skills, Projects, and Research.
- **AI Assistant (Orbit):** Integrated Gemini-powered chatbot to answer questions about my resume.
- **Dynamic Content:** Projects and Research papers are fetched dynamically from MongoDB.

### 🛡️ Admin Dashboard (CMS)
- **Secure Authentication:** JWT-based login system.
- **Project Management:** Add, Edit, or Delete portfolio projects directly from the UI.
- **Message Inbox:** View inquiries sent via the Contact form.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI Integration** | Google Gemini API |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 📂 Project Structure

```text
smri29.net/
├── frontend/         # React Frontend
│   ├── src/
│   │   ├── assets/   # Images & Icons
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
├── backend/          # Node.js Backend
│   ├── config/       # DB Connection
│   ├── controllers/  # Logic
│   ├── models/       # Mongoose Schemas
│   └── routes/       # API Endpoints
└── README.md

# Clone the repository

git clone [https://github.com/smri29/smri29.net.git](https://github.com/smri29/smri29.net.git)
cd smri29.net

# Setup Backend

cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_string
# JWT_SECRET=your_secret_key
# GEMINI_API_KEY=your_ai_key

npm run dev

# Setup Frontend

cd ../frontend
npm install
npm run dev

👨‍💻 Author
Shah Mohammad Rizvi ML Researcher & Founder @ CollabCircle

📧 Email: smri29.ml@gmail.com

🔗 LinkedIn: smri29

🐙 GitHub: smri29

© 2026 Shah Mohammad Rizvi. All Rights Reserved.