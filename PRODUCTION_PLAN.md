# Production Plan: Multi-School Management System (EduSphere)

## 1. Executive Summary
Develop a scalable, secure, and high-performance Multi-School Management System using the MERN stack (MongoDB, Express, React, Node.js). The system will support multiple user roles (Super Admin, Admin, Sub-Admin, Teacher, Student, Parent) and provide comprehensive features for academic and administrative management.

## 2. Technology Stack

### Frontend (Client)
- **Framework:** React.js (Vite for build tool)
- **Styling:** Vanilla CSS (Modular, with CSS Variables for theming) for maximum performance and customizability (per requirements).
- **State Management:** React Context API + useReducer (or Redux Toolkit if complexity grows).
- **Routing:** React Router v6.
- **HTTP Client:** Axios.
- **Charts/Visuals:** Recharts or Chart.js for attendance/results analytics.

### Backend (Server)
- **Runtime:** Node.js.
- **Framework:** Express.js.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs for password hashing.
- **File Storage:** AWS S3 (for homework, results, profile pictures).
- **Validation:** Joi or Zod.
- **Logging:** Winston or Morgan.

### DevOps & Hosting
- **Frontend Hosting:** Vercel.
- **Backend Hosting:** Render.
- **Database:** MongoDB Atlas.
- **CI/CD:** GitHub Actions (for automated testing and deployment).
- **Version Control:** Git & GitHub.

## 3. System Architecture & Database Schema

### 3.1 Architecture
- **Monorepo Structure (Conceptual):**
  - `/client`: React Application.
  - `/server`: Node.js Application.
- **API Pattern:** RESTful API.
- **Security:** Helmet.js, CORS, Rate Limiting, Data Sanitization.

### 3.2 Database Collections
1.  **Schools**
    - `schoolId`, `name`, `address`, `contact`, `subscriptionPlan`, `adminId` (Principal).
2.  **Users**
    - `name`, `email`, `password`, `role` (SuperAdmin, Admin, SubAdmin, Teacher, Student, Parent), `schoolId`, `profilePixel`.
3.  **Classes**
    - `className` (e.g., "Class 10"), `schoolId`.
4.  **Sections**
    - `sectionName` (e.g., "A", "B"), `classId`, `schoolId`, `teacherId` (Class Teacher).
5.  **Students** (Linked to User)
    - `userId`, `classId`, `sectionId`, `rollNumber`, `parentId`.
6.  **Attendance**
    - `date`, `userId` (Student/Teacher/SubAdmin), `status` (Present/Absent/Late), `rectificationRequest` (Pending/Approved/Rejected), `markedBy`.
7.  **Homework**
    - `title`, `description`, `classId`, `sectionId`, `subject`, `deadline`, `attachmentUrl` (S3), `teacherId`.
8.  **Results**
    - `examName`, `studentId`, `subject`, `marksObtained`, `totalMarks`, `grade`, `attachmentUrl`.
9.  **Announcements**
    - `title`, `content`, `targetAudience` (All/Teachers/Students), `schoolId`, `date`.

## 4. Role-Based Access Control (RBAC) Matrix

| Feature | Super Admin | Admin (Principal) | Sub-Admin (Vice Principal) | Teacher | Student | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Schools** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Add Teachers** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mark Teacher Attendance** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Mark Student Attendance** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Rectify Attendance** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Request Attendance Rectification** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **View Announcements** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Announcements** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Upload Results** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **View Results** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload Homework** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## 5. Development Roadmap & Status

- [x] **Phase 1: Foundation & Authentication**
  - [x] Project Structure Setup
  - [x] MongoDB Connection
  - [x] Authentication (Login, Register, Role Middleware)

- [x] **Phase 2: User & School Management**
  - [x] Super Admin Dashboard (Create Schools)
  - [x] Admin Dashboard (Manage Teachers, Students)
  - [x] Class Management (Create Classes)

- [x] **Phase 3: Attendance System**
  - [x] Mark Attendance (Teachers/Admins)
  - [x] View Attendance (Students/Teachers)
  - [x] Rectification Logic (Request & Approve)

- [x] **Phase 4: Results, Homework & Announcements**
  - [x] Result Schema & Controller (Upload/View)
  - [x] Homework Schema & Controller (Assign/View)
  - [x] Announcement Schema & Controller (Post/View)
  - [x] Teacher Dashboard Updates
  - [x] Student Dashboard Implementation

- [x] **Phase 5: Parent Access & Refinement**
  - [x] Parent Dashboard (View Child's Data)
  - [x] Link Parent to Student (Admin)
  - [x] Admin Rectification Approval UI

- [ ] **Phase 6: Final Polish & Deployment**
  - [x] UI/UX Polish (Animations, Responsive checks)
  - [x] Deployment Config (Vercel/Render)
  - [ ] Final Testing
