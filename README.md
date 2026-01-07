```markdown
# 🚀 Shah Mohammad Rizvi | Portfolio

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-000000?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> **A dynamic, research-centric portfolio built with the MERN stack.** Features a custom modular Admin CMS for managing publications, projects, and certifications without code changes. Designed with a modern "Editorial" aesthetic combining academic authority with engineering precision.

---

## 🌟 Key Features

### 🎨 Public Interface
- **Modern Editorial Design:** A unique UI combining **Times New Roman** (Academic) with **Neon Pink** (Tech), featuring a custom grid background.
- **Segmented Portfolio:** Distinct sections for **Research Papers** (Journals/Conferences), **Engineering Projects**, and **Certifications**.
- **Dynamic Content:** All data—including skills lists and publication details—is fetched live from MongoDB.
- **Responsive Layout:** Optimized for all devices with smooth scrolling navigation.

### 🛡️ Modular Admin Dashboard (CMS)
- **Secure Authentication:** JWT-based protection for administrative access.
- **Sidebar Navigation:** Switch between different management modules seamlessly.
- **CRUD Engines:** Dedicated forms to Add, Edit, and Delete:
    - **Research Manager:** Handle DOI links, citations, and abstracts.
    - **Project Manager:** Manage tech stacks, repositories, and live demos.
    - **Certificate Manager:** Track issuing organizations and verification links.
    - **Skill Matrix:** Upsert logic to manage technical skills by category.
- **Message Inbox:** View and delete recruiter inquiries sent via the Contact form.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js, Nodemailer |
| **Database** | MongoDB Atlas (4 Distinct Schemas) |
| **Design** | Glassmorphism, Editorial Typography |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 📂 Project Structure

```text
smri29.net/
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── assets/       # Images & Icons
│   │   ├── components/   # Modular UI Components (Navbar, Sidebar, Managers)
│   │   ├── pages/        # Main Views (Home, Dashboard, Login)
│   │   └── api/          # Axios Configuration
├── backend/              # Node.js Backend
│   ├── config/           # DB Connection
│   ├── controllers/      # CRUD Logic for Research, Projects, Skills
│   ├── models/           # Mongoose Schemas (Strict Typing)
│   └── routes/           # Protected API Endpoints
└── README.md

```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone [https://github.com/smri29/smri29.net.git](https://github.com/smri29/smri29.net.git)
cd smri29.net

```

### 2. Setup Backend

```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secure_random_string
# EMAIL_USER=your_email
# EMAIL_PASS=your_app_password

npm run dev

```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev

```

---

## 👨‍💻 Author

**Shah Mohammad Rizvi** *AI/ML Researcher & Full Stack Engineer* Founder @ CollabCircle

📧 **Email:** [smri29.ml@gmail.com](mailto:smri29.ml@gmail.com)

🔗 **LinkedIn:** [smri29](https://www.google.com/search?q=https://linkedin.com/in/smri29)

🐙 **GitHub:** [smri29](https://github.com/smri29)

🧠 **Kaggle:** [shahmohammadrizvi](https://www.kaggle.com/shahmohammadrizvi)

---

© 2026 Shah Mohammad Rizvi. All Rights Reserved.

```

```