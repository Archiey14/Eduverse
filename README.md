# 🎓 Eduverse - Learning Management System

![Eduverse Banner](https://img.shields.io/badge/Eduverse-Learning_Management_System-blue?style=for-the-badge)

Eduverse is a comprehensive, full-stack Learning Management System (LMS) built with a modern tech stack. It empowers mentors to create and manage courses, and allows students to enroll, track their progress, earn certificates, and engage with AI-assisted learning.

---

## 🚀 Features

### For Students
- **Course Catalog & Filtering:** Browse courses with advanced search and filtering (category, price, ratings).
- **Secure Authentication:** Local authentication (JWT) and Firebase Google OAuth support.
- **Cart & Checkout:** Add courses to your cart and enroll securely.
- **Interactive Dashboard:** Track learning progress, recent activity, and earned certificates.
- **AI Learning Assistant:** Integrated AI chat to help clarify concepts and answer questions.
- **Quizzes & Assessments:** Test your knowledge after completing lessons.
- **Wishlist:** Save courses for later.

### For Mentors & Admins
- **Course Management:** Create, edit, and publish new courses and lessons.
- **Student Tracking:** View enrollment metrics and student progress.
- **Admin Dashboard:** Centralized view of platform activity, revenue, and user roles.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS / Custom CSS
- **Authentication:** Firebase Client SDK
- **Icons:** Lucide React & React Icons

### Backend
- **Runtime:** Node.js (v18+) & Express 5
- **Database:** MongoDB (via Mongoose)
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs
- **Auth Tokens:** JSON Web Tokens (JWT)
- **AI Integration:** Google Generative AI SDK & Groq SDK
- **File Uploads:** Multer
- **Email/Notifications:** Nodemailer

---

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eduverse.git
cd eduverse
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory with your Firebase configuration (if applicable) and backend API URL:
```env
VITE_API_URL=http://localhost:5001/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🧪 Testing

The backend includes a QA suite structured with **Jest** and **Supertest**.
To run the API verification tests:
```bash
cd backend
npm run test
```
*Note: A detailed QA report is generated and can be found in the QA artifacts.*

---

## 📂 Project Structure

```text
Eduverse/
├── backend/
│   ├── src/
│   │   ├── config/      # DB and Environment config
│   │   ├── controllers/ # API Logic
│   │   ├── middleware/  # Auth, Error Handling, Rate Limiting
│   │   ├── models/      # Mongoose Schemas (User, Course, Enrollment, etc.)
│   │   ├── routes/      # Express API Routes
│   │   └── utils/       # Helpers and Pagination
│   ├── tests/           # Jest integration tests
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React Context (Auth, Theme)
    │   ├── pages/       # Page views (Admin, Student, Auth)
    │   └── App.tsx      # Main application router
```

---

## 📝 License

This project is licensed under the MIT License.
