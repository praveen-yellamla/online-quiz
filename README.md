# CGS Online Quiz & Exam Platform

A production-level, high-security enterprise examination ecosystem built for **Crestonix Global Solutions (CGS)**, optimized for high-stakes assessments and track-based candidate evaluation.

## 🚀 Advanced Features

### 🔐 1. Multi-Role RBAC (Role-Based Access Control)
- **SUPER_ADMIN (Executive Oversight)**: 
  - Global system governance and infrastructure maintenance.
  - Comprehensive oversight of all localized admins and candidate rosters.
  - System-wide logging and audit trail sanitization.
- **ADMIN (Track-Specific Lead)**: 
  - Isolated management of specific tech tracks (Java, Python, SQL, JavaScript).
  - Advanced Exam Lifecycle Management (Draft -> Published -> Archived).
  - Bulk question ingestion via **Excel Synchronizer**.
- **STUDENT (Candidate)**: 
  - Dynamic profile mapping to specific tech tracks.
  - Real-time performance telemetry and localized leaderboards.

### 🛡️ 2. Professional Proctoring Suite
- **Identity Protocol**: Mandatory biometric verification via webcam during registration and assessment entry.
- **Continuous Monitoring**: Pulse snapshots captured periodically throughout the exam duration.
- **Integrity Violation Engine**: 
  - Real-time detection of tab switching, window blurring, and browser resizing.
  - Automatic assessment termination upon reaching the violation threshold (default: 3).

### 📊 4. Smart Data Systems
- **Excel Synchronizer**: Batch ingest assessment clusters using professional `.xlsx` templates.
- **Dynamic Leaderboards**: Multi-dimensional ranking logic (Score > Accuracy > Speed).
- **PDF Protocol**: Generate and download official examination papers for offline auditing.
- **Edge-Ready Architecture**: Powered by Turso LibSQL for global performance and high availability.

---

## 🛠️ Technical Stack
- **Frontend**: React (Vite), Framer Motion, Lucide React, Recharts, Monaco Editor.
- **Backend**: Node.js, Express, LibSQL (Turso), JWT, Socket.io (Real-time Node Monitoring).
- **Security**: BCrypt hashing, JWT Authorization Middleware, Route-level RBAC.
- **Cloud Infrastructure**: Cloudinary (Image Proctoring Storage).

---

## ⚙️ Setup Instructions

### 1. Requirements
- Node.js (v18+)
- Turso DB Account (for edge data operations)
- Cloudinary Account (for security snap storage)

### 2. Infrastructure Deployment (Backend)
1. `cd backend`
2. Configure `.env` with:
   - `TURSO_URL` & `TURSO_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
3. `npm install`
4. `npm start` (Operates on port 5001)

### 3. Application Launch (Frontend)
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Operates on port 5173)

---

## 🗝️ System Governance Credentials
- **Super Admin Oversight**:
  - `superadmin@crestonix.com` / `123456`
- **Default Subject Credentials**:
  - Track Admins & Students use `123456` as the standard password for initial verification.

---

Built by **Antigravity AI** for **Crestonix Global Solutions**.
