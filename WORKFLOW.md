# Application Workflow and Architecture

This document outlines the workflow, system architecture, technologies used, and modules implemented in the CareerGuideAI application.

## 1. System Architecture

The application is built using a **monolithic architecture** with a **client-server model**.

- **Frontend:** A Single-Page Application (SPA) built with **Next.js (React)**.
- **Backend:** Integrated within the same Next.js project, using **API Routes** to handle business logic and data processing.
- **Database:** A **PostgreSQL** database is used for data persistence, with **Prisma** as the Object-Relational Mapper (ORM).
- **External Services:** The application interacts with several external services:
  - **Clerk:** For user authentication and management.
  - **Google Generative AI & Anthropic (Claude):** For various AI-powered features.
  - **Inngest:** For managing background jobs and long-running tasks.

## 2. Technologies Used

### Frontend

- **Framework:** Next.js (v15) / React (v19)
- **Styling:** Tailwind CSS, Radix UI, lucide-react (icons)
- **UI Components:** Shadcn UI (based on Radix UI), `sonner` (notifications), `react-spinners` (loading indicators)
- **Form Handling:** `react-hook-form`, `zod` (validation)
- **PDF Handling:** `@react-pdf/renderer`, `html2pdf.js`

### Backend

- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database ORM:** Prisma
- **AI Integration:** `@google/generative-ai`, `@anthropic-ai/sdk`
- **PDF Parsing:** `pdf2json`, `pdf-parse`
- **Background Jobs:** Inngest

### Database

- **Engine:** PostgreSQL
- **Schema Management:** Prisma Migrate

### Authentication

- **Provider:** Clerk

---

## Technologies Summary

- **Next.js 15.5.7 (App Router, Turbopack):** Main framework for frontend and backend (API routes).
- **React 19:** UI library for building interactive components.
- **Tailwind CSS 4:** Utility-first CSS framework for styling.
- **Radix UI:** Accessible UI primitives (dropdowns, dialogs, tooltips, etc.).
- **Lucide-react:** Icon set for UI elements.
- **Prisma ORM:** Database access and schema management, custom client output.
- **PostgreSQL (Neon):** Cloud database for persistent storage.
- **Clerk v6:** Authentication and user management.
- **Anthropic Claude, Google Generative AI:** AI features (course rating, improvement tips, etc.).
- **html2canvas, pdf-lib, jspdf:** Certificate and resume PDF generation and download.
- **Sonner:** Notification system for user feedback.
- **Zod:** Schema validation for forms and API data.
- **date-fns:** Date utilities for formatting and calculations.

## Key Modules / Features

- **Authentication:** User sign-up/sign-in, session management (Clerk).
- **Course Prep:** Create, view, and track courses; AI-generated ratings; progress tracking; certificate issuance.
- **Interview Prep:** Quizzes (technical/behavioral), improvement tips, streak tracking.
- **Resume Studio:** Multi-resume management, markdown editing, PDF export.
- **Streak & Certifications:** Daily streak tracking, badge awards, certificate display/download.
- **Market Overview:** Industry insights, salary ranges, growth rates, skill recommendations.
- **API Routes:** Modular endpoints for all business logic (Next.js API routes).
- **Database Schema:** Prisma models for User, Course, Certificate, Assessment, Resume, CoverLetter, IndustryInsight.

---

## 3. Application Workflow

### 3.1. Onboarding and User Profile

1.  **Sign-up/Sign-in:** A new user signs up or signs in using Clerk.
2.  **User Creation:** A corresponding `User` record is created in the database, linked to the Clerk user ID.
3.  **Onboarding:** The user is prompted to provide details about their `industry`, `specializations`, `experience`, and `skills`. This information is stored in their `User` profile in the database.

### 3.2. Core Feature Workflows

#### ATS Resume Checker

1.  **Frontend (Client-Side):**

    - The user navigates to the "ATS Checker" page.
    - They input a job description and upload a resume (PDF).
    - On form submission, a `POST` request is sent to the `/api/ats-checker` endpoint with the job description and resume file.

2.  **Backend (Server-Side):**

    - The API route `/api/ats-checker/route.js` receives the request.
    - It extracts the text from the uploaded PDF resume using the `pdf2json` library.
    - It constructs a detailed prompt for an AI model (Anthropic's Claude), instructing it to act as an ATS and evaluate the resume against the job description.
    - The prompt and data are sent to the AI model.
    - The AI's response, containing the resume analysis (match percentage, missing keywords, etc.), is received.

3.  **Frontend (Client-Side):**
    - The analysis from the backend is received as a JSON response.
    - The results are displayed to the user.

#### Resume Builder

- Users can create, edit, and manage multiple resumes.
- The resume content is written in Markdown and stored in the `Resume` table in the database, linked to the user's profile.

#### Course Generator

- This feature likely uses an AI model to generate personalized learning roadmaps for users.
- The user might input their desired role or skills.
- The backend communicates with an AI model to generate a course structure, including `title`, `description`, `chapters`, and a `roadmap` (in Markdown).
- The generated course is stored in the `Course` table.

#### Interview Preparation

- The `Assessment` data model suggests a feature for interview practice.
- Users can take quizzes (`Technical`, `Behavioral`, etc.).
- The user's answers are stored, and they receive a score and AI-generated tips for improvement.

#### Certificates

- When a user completes a course (likely by marking all chapters/sections as complete), a `Certificate` is generated.
- The certificate is stored in the `Certificate` table, linked to the user and the completed course.

## 4. Database Schema

The database schema is defined in `prisma/schema.prisma` and includes the following models:

- **`User`:** Stores user profile information, authentication details (Clerk ID), and tracks their activity streak. This is the central model, linked to most other models.
- **`Resume`:** Stores user-created resumes with a title and Markdown content. A user can have multiple resumes.
- **`CoverLetter`:** Stores cover letters, also in Markdown.
- **`Course`:** Represents a course, including its structure, content (roadmap), and user progress.
- **`Certificate`:** Represents a certificate of completion for a course.
- **`Assessment`:** Stores the results of quizzes or assessments taken by the user.
- **`IndustryInsight`:** Contains data about various industries, such as salary ranges, demand, and key trends. This is likely used to provide guidance to users.

This structure allows for a rich, interconnected experience where a user's profile and activities are all linked, enabling personalized recommendations and tracking of their career development journey.
