# LegalConnect Architecture Document

## 1. 🧱 Project Overview

LegalConnect is a full-stack web application for lawyer-client matchmaking, appointment scheduling, case registration, and document management. Built on modern tooling and best practices, it aims to serve as the digital backbone of India's legal service discovery ecosystem.

---

## 2. 🛠️ Tech Stack Summary

### 2.1 Frontend

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + ShadCN
- React Query or SWR for data fetching

### 2.2 Backend

- Supabase (PostgreSQL, Auth, Storage)
- Supabase Edge Functions or Next.js API routes (light backend)

### 2.3 Infrastructure

- Vercel for frontend deployment
- Supabase for backend
- GitHub CI/CD

### 2.4 Security

- JWT-based auth with Supabase
- Row-level security for data isolation
- HTTPS everywhere
- Encrypted file storage

---

## 3. 🗂️ Project Structure

### 3.1 Application Layout

```
legalconnect/
├── app/
│   ├── auth/ (login, register)
│   ├── dashboard/ (citizen/lawyer dashboards)
│   ├── lawyers/ (search, profile view)
│   ├── admin/ (admin panel routes)
│   └── api/ (REST endpoints)
├── components/
├── lib/ (supabaseClient, auth helpers, utils)
├── hooks/ (useAuth, useAppointments)
├── constants/ (roles, routes)
├── middleware.ts
├── tailwind.config.ts
├── .env.local
```

---

## 4. 🔧 Data Architecture

### 4.1 Database Entities

#### 4.1.1 Users

- id UUID (PK)
- email VARCHAR UNIQUE NOT NULL
- password_hash TEXT
- role ENUM('citizen', 'lawyer', 'admin')
- full_name TEXT
- phone_number TEXT
- created_at TIMESTAMP

#### 4.1.2 Lawyer Profiles

- id UUID (PK, FK -> users.id)
- bar_council_id VARCHAR UNIQUE NOT NULL
- bio TEXT
- specialties TEXT[]
- experience_years INT
- is_verified BOOLEAN DEFAULT FALSE
- profile_image TEXT
- created_at TIMESTAMP

#### 4.1.3 Appointments

- id UUID (PK)
- citizen_id UUID (FK -> users.id)
- lawyer_id UUID (FK -> users.id)
- status ENUM('pending', 'accepted', 'rejected', 'completed')
- scheduled_time TIMESTAMP
- duration_min INT
- notes TEXT
- created_at TIMESTAMP

**case_documents**

- id UUID (PK)
- appointment_id UUID (FK -> appointments.id)
- uploaded_by UUID (FK -> users.id)
- file_url TEXT
- file_type TEXT
- is_sensitive BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP

**feedback**

- id UUID (PK)
- appointment_id UUID (FK)
- from_user UUID (FK -> users.id)
- to_user UUID (FK -> users.id)
- rating INTEGER CHECK (rating BETWEEN 1 AND 5)
- comment TEXT
- created_at TIMESTAMP

**complaints**

- id UUID (PK)
- submitted_by UUID (FK -> users.id)
- against_user UUID (FK -> users.id)
- appointment_id UUID (nullable)
- reason TEXT
- status ENUM('open', 'under_review', 'resolved', 'rejected')
- created_at TIMESTAMP

**subscriptions**

- id UUID (PK)
- lawyer_id UUID (FK -> users.id)
- plan_type ENUM('free', 'premium_yearly', 'trial')
- start_date DATE
- end_date DATE
- is_active BOOLEAN
- created_at TIMESTAMP

**kyc_verification**

- id UUID (PK)
- user_id UUID (FK -> users.id)
- document_type TEXT
- document_url TEXT
- status ENUM('pending', 'approved', 'rejected')
- submitted_at TIMESTAMP
- reviewed_at TIMESTAMP

---

## 5. 📡 API Architecture

### 5.1 REST Endpoints

#### 5.1.1 Authentication Endpoints

- POST /register, /login, /logout
- GET /me

**/lawyers**

- GET /search, /\:id, /\:id/feedback
- POST / (create), PATCH /\:id (update)

**/appointments**

- POST / (create)
- GET /\:id, /user/\:id
- PATCH /\:id (status updates)

**/documents**

- POST / (upload), GET /appointment/\:id

**/feedback**

- POST /, GET /lawyer/\:id

**/complaints**

- POST /, PATCH /\:id

**/subscriptions**

- POST /start, GET /lawyer/\:id

**/verification**

- POST /, PATCH /\:id (admin only)

---

## 6. 🔐 Security Architecture

### 6.1 Access Control

- Supabase Auth manages sessions + JWT
- RLS ensures users only access their data
- Lawyer profiles editable only by lawyer or admin
- Admin-only API access guarded via middleware
- Signed URLs for document access (no public access)

---

## 7. ☁️ Infrastructure Architecture

- Horizontally scalable PostgreSQL via Supabase
- CDN delivery for static assets via Vercel
- Async task planning via Edge Functions or cron jobs (for notifications, reminders)
- Cloudflare layer for DDoS protection + rate limiting

---

## 8. 🔮 Future Architecture

### 8.1 Post-MVP Enhancements

- Move backend to NestJS or Laravel if complexity grows
- Add Redis queue for delayed jobs (case updates, reminders)
- Launch mobile app with React Native (same backend)
- Plug into Indian legal APIs (Bar Council, Court data)
- Add billing module (for invoices, online payments)

---

## Document Information

- **Status:** Architecture confirmed and PRD aligned. Ready for development and initial scaffolding.
- **Owner:** Lena (Architect)
- **Linked Doc:** `LegalConnect_PRD`
- **Last Updated:** July 16, 2025
