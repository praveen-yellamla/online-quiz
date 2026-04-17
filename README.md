# CGS Online Quiz & Exam Platform

A production-level, high-security examination platform built for **Crestonix Global Solutions (CGS)**.

## 🚀 Advanced Features

### 🔐 1. Multi-Role RBAC
- **SUPER_ADMIN (Director)**: System-wide control, admin management, maintenance mode, and global analytics.
- **ADMIN (Subject-based)**: Assignment-based management (Java, Python, SQL, JavaScript). Managed language-specific exams and results.
- **STUDENT**: Self-registration with identity verification and subject focus.

### 🛡️ 2. AI-Powered Proctoring
- **Identity Verification**: Mandatory webcam capture during registration and exam start.
- **Periodic Snapshots**: Automated webcam captures every 20 seconds during active assessments.
- **Violation Detection**: Real-time monitoring of tab switches and window blur events.
- **Force Submission**: Automatic assessment termination after 3 integrity violations.

### 📊 3. Smart Systems
- **Language Mapping**: Automated student-to-admin mapping based on tech stack.
- **Language-based Leaderboard**: Complex ranking logic (Score > Time > Speed).
- **Maintenance Mode**: System-wide lockdown for non-director users during updates.
- **Cloudinary Integration**: Fully headless image management for secure snapshot storage.

---

## 🛠️ Technical Stack
- **Frontend**: React (Vite), Framer Motion, Lucide React, Recharts, React Webcam.
- **Backend**: Node.js, Express, Better-SQLite3, JWT (Headless Auth).
- **Storage**: Cloudinary (Image Proctoring).

---

## ⚙️ Setup Instructions

### 1. Requirements
- Node.js installed.
- Cloudinary Account (for proctoring).

### 2. Backend Setup
1. `cd backend`
2. Update `.env` with your Cloudinary credentials.
3. `npm install`
4. `node init_super_admin.js` (Creates initial director account).
5. `npm run dev` (Runs on port 5001).

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173).

---

## 🗝️ Default Director Account
- **Email**: `superadmin@crestonix.com`
- **Password**: `Password@123`

---

Built with ❤️ for **Crestonix Global Solutions**.
