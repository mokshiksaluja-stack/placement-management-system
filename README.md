# Campus Placement Management System

This project is a full-stack MERN application built by a 3-member team with separate module ownership:
- Admin module
- Placement Coordinator module
- Student module

Current branch primarily implements the **Placement Coordinator** workflow with integration points for the other modules.

## Tech Stack

- Frontend: React (functional components), React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB with Mongoose

## Folder Structure

```text
root/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Card.jsx
│       │   └── Table.jsx
│       ├── pages/
│       │   └── coordinator/
│       │       ├── Dashboard.jsx
│       │       ├── Companies.jsx
│       │       ├── Tasks.jsx
│       │       ├── Interviews.jsx
│       │       └── Results.jsx
│       ├── services/
│       │   └── coordinatorApi.js
│       ├── App.js
│       └── index.js
└── server/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── coordinatorController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Task.js
    │   ├── Interview.js
    │   ├── Opportunity.js
    │   └── Result.js
    ├── routes/
    │   └── coordinatorRoutes.js
    └── server.js
```

## MVC Architecture

- **Models** (`server/models`) define MongoDB schema structure.
- **Controllers** (`server/controllers`) hold business logic for each endpoint.
- **Routes** (`server/routes`) map HTTP routes to controller methods.
- **Config** (`server/config/db.js`) manages database connection setup.


## Coordinator Features

### 1) Dashboard
- `GET /api/coordinator/dashboard`
- Returns:
  - `assignedCompanies`
  - `pendingTasks`
  - `interviewsToday`
  - `completedTasks`

### 2) Assigned Companies
- `GET /api/coordinator/opportunities`
- Returns list with:
  - `companyName`
  - `role`
  - `interviewDate`
  - `status`

### 3) Task Management
- `GET /api/coordinator/tasks`
- `POST /api/coordinator/tasks`
- `PATCH /api/coordinator/tasks/:id`
- Fields:
  - `title`
  - `company`
  - `deadline`
  - `status`
  - `source` (`self` / `admin`)
  - `assigneeUser` (future admin assignment compatibility)
  - `assignedBy` (future admin assignment compatibility)

### 4) Interview Management
- `GET /api/coordinator/interviews`
- `POST /api/coordinator/interviews`
- `PATCH /api/coordinator/interviews/:id`
- Fields:
  - `company`
  - `role`
  - `roundType`
  - `date`
  - `time`
  - `room`

### 5) Results Update
- `POST /api/coordinator/results`
- Stores:
  - `studentName`
  - `result`
  - `round`

## Data Flow (Frontend -> Backend -> Database)

1. React pages call Axios methods from `client/src/services/coordinatorApi.js`.
2. API request goes to Express route in `server/routes/coordinatorRoutes.js`.
3. Route forwards request to controller function in `server/controllers/coordinatorController.js`.
4. Controller reads/writes data using Mongoose models in `server/models`.
5. MongoDB stores data and response is returned back to React UI.

## Routes in Frontend

- `/coordinator/dashboard`
- `/coordinator/companies`
- `/coordinator/tasks`
- `/coordinator/interviews`
- `/coordinator/results`
- `/coordinator/profile`
- `/coordinator/settings`
- `/coordinator/student` (student placeholder tab for teammate integration)

## How to Run

### Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd client
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placement_management
JWT_SECRET=change_this_to_a_secure_secret
```

## Module Ownership (Team Workflow)

- **Coordinator owner (you):**
  - Coordinator auth and coordinator-facing dashboard
  - Coordinator task/opportunity/interview/result flows
  - Student-tab integration shell inside coordinator profile
- **Admin owner (teammate):**
  - Company-level oversight
  - Task assignment to coordinators
  - Global monitoring/reporting
- **Student owner (teammate):**
  - Student dashboard, eligibility/opportunity discovery
  - Readiness score and recommendations

## API Contract Notes For Integration

These contracts are the shared expectations across teammate modules.

### 1) Admin -> Coordinator Task Assignment Contract

Target collection: `Task`

Suggested payload:

```json
{
  "title": "Collect resumes for Company X",
  "company": "Company X",
  "deadline": "2026-04-20T00:00:00.000Z",
  "status": "Pending",
  "source": "admin",
  "assigneeUser": "coordinator_user_id",
  "assignedBy": "admin_user_id"
}
```

Coordinator-side visibility rule:
- Show tasks where `assigneeUser == loggedInUserId` OR legacy `user == loggedInUserId`.

### 2) Student Opportunities Feed Contract

Expected endpoint (student module):
- `GET /api/student/opportunities`

Suggested response item shape:

```json
{
  "_id": "opportunity_id",
  "companyName": "Company X",
  "role": "Software Engineer Intern",
  "interviewDate": "2026-04-22T00:00:00.000Z",
  "status": "Open",
  "eligibility": {
    "minCgpa": 7.0,
    "allowedBranches": ["CSE", "IT"]
  }
}
```

### 3) Student Readiness Score Contract

Expected endpoint (student module):
- `GET /api/student/readiness`

Suggested response:

```json
{
  "studentId": "student_user_id",
  "overallScore": 74,
  "breakdown": {
    "aptitude": 78,
    "coding": 70,
    "communication": 72,
    "resume": 76
  },
  "updatedAt": "2026-04-08T09:00:00.000Z"
}
```

## Merge Checklist (Weekly Integration)

Use this checklist before merging module branches into integration/main:

1. Pull latest `main` and resolve route/model conflicts.
2. Confirm shared schema keys still match contracts (`Task`, `Opportunity`, readiness payload).
3. Verify auth guard behavior per route.
4. Run frontend build and smoke-test key pages.
5. Validate DB scoping rules (no cross-user data leakage).
6. Update README contracts if any shared payload changed.
