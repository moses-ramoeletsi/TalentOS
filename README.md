# TalentOS — Smart HR Recruitment System

A full-stack web application for HR departments to manage job applications intelligently using AI-powered CV parsing, candidate ranking, interview scheduling, and analytics.

---

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, React Router v6, Axios, Chart.js |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB + Mongoose                      |
| Auth       | JWT + bcryptjs                          |
| File Upload| Multer                                  |
| CV Parsing | pdf-parse + mammoth                     |
| Email      | Nodemailer                              |
| AI         | Claude API (Anthropic)                  |

---

## Project Structure

```
hr-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── interviewController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── interviews.js
│   │   ├── users.js
│   │   └── analytics.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + role authorise
│   │   └── upload.js        # Multer CV upload
│   ├── utils/
│   │   ├── cvParser.js      # PDF/DOCX parsing + AI scoring
│   │   ├── email.js         # Nodemailer templates
│   │   └── seed.js          # Demo data seeder
│   ├── uploads/             # CV files stored here
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js    # Sidebar + topbar shell
    │   │   └── UI.js        # Reusable components
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Jobs.js
    │   │   ├── JobDetail.js
    │   │   ├── PostJob.js
    │   │   ├── Applicants.js
    │   │   ├── CandidateProfile.js
    │   │   ├── Pipeline.js
    │   │   ├── Interviews.js
    │   │   ├── AIRanking.js
    │   │   ├── Analytics.js
    │   │   ├── ApplyJob.js
    │   │   └── MyApplications.js
    │   ├── services/
    │   │   └── api.js       # All Axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Git

### 2. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hr_recruitment
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=TalentOS HR <your_gmail@gmail.com>

CLIENT_URL=http://localhost:3000
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

### 4. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@talentos.com` / `Admin@123`
- HR Manager: `hr@talentos.com` / `Hr@12345`
- Candidate: `alex@gmail.com` / `Test@123`
- 4 sample job vacancies

### 5. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint                | Access    | Description          |
|--------|-------------------------|-----------|----------------------|
| POST   | /api/auth/register      | Public    | Register candidate   |
| POST   | /api/auth/login         | Public    | Login                |
| GET    | /api/auth/me            | Protected | Get current user     |
| POST   | /api/auth/create-staff  | Admin     | Create HR manager    |

### Jobs
| Method | Endpoint        | Access        | Description      |
|--------|-----------------|---------------|------------------|
| GET    | /api/jobs       | Public        | List all jobs    |
| GET    | /api/jobs/:id   | Public        | Get single job   |
| POST   | /api/jobs       | HR/Admin      | Create job       |
| PUT    | /api/jobs/:id   | HR/Admin      | Update job       |
| DELETE | /api/jobs/:id   | Admin         | Delete job       |

### Applications
| Method | Endpoint                          | Access    | Description               |
|--------|-----------------------------------|-----------|---------------------------|
| POST   | /api/applications                 | Candidate | Apply (with CV upload)    |
| GET    | /api/applications                 | Protected | List (filtered by role)   |
| GET    | /api/applications/:id             | Protected | Get single application    |
| PATCH  | /api/applications/:id/status      | HR/Admin  | Update status             |
| GET    | /api/applications/job/:id/ranked  | HR/Admin  | Ranked candidates for job |
| GET    | /api/applications/:id/cv          | Protected | Download CV               |

### Interviews
| Method | Endpoint            | Access   | Description        |
|--------|---------------------|----------|--------------------|
| POST   | /api/interviews     | HR/Admin | Schedule interview |
| GET    | /api/interviews     | Protected| List interviews    |
| PATCH  | /api/interviews/:id | HR/Admin | Update interview   |
| DELETE | /api/interviews/:id | HR/Admin | Cancel interview   |

### Analytics
| Method | Endpoint                              | Access   |
|--------|---------------------------------------|----------|
| GET    | /api/analytics/overview               | HR/Admin |
| GET    | /api/analytics/applications-per-month | HR/Admin |
| GET    | /api/analytics/job-demand             | HR/Admin |
| GET    | /api/analytics/pipeline               | HR/Admin |
| GET    | /api/analytics/score-distribution     | HR/Admin |

---

## Features

### For HR / Admin
- ✅ Dashboard with live stats + charts
- ✅ Post, edit, delete job vacancies
- ✅ View all applicants with filters
- ✅ Automatic CV parsing (PDF + DOCX)
- ✅ AI candidate scoring (skills 50% + experience 30% + qualification 20%)
- ✅ Claude AI-powered ranking insights
- ✅ Pipeline Kanban board
- ✅ Schedule interviews + auto email
- ✅ Analytics with 4 Chart.js visualisations

### For Candidates
- ✅ Register and login
- ✅ Browse active job vacancies
- ✅ Upload CV with drag & drop
- ✅ Track application status with pipeline progress bar
- ✅ Receive email notifications (applied, shortlisted, rejected, interview invite)

---

## User Roles

| Role        | Permissions                                          |
|-------------|------------------------------------------------------|
| admin       | Full access including user management and job deletion |
| hr_manager  | Manage jobs, applicants, interviews, view analytics  |
| candidate   | Browse jobs, apply, track own applications           |

---

## Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables in your hosting platform
2. Set `MONGO_URI` to your MongoDB Atlas connection string
3. Deploy the `backend/` folder

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build: `npm run build`
3. Deploy the `frontend/build/` folder

---

## License
MIT — free to use and modify.
