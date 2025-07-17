# API Architecture

## REST Endpoints

### Authentication Endpoints

- POST /api/auth/callback, /api/auth/login, /api/auth/logout, /api/register
- GET /api/auth/session

### Lawyers

- GET /api/lawyers/search, /api/lawyers/[lawyerId]
- POST /api/profile (create/update lawyer profile)

### Appointments

- POST /api/appointments/book
- GET /api/appointments, /api/appointments/completed

### Documents

- POST /api/upload/document
- GET /api/documents, /api/documents/download/[fileId]

### Feedback

- POST /api/feedback
- GET /api/admin/feedback

### Admin Endpoints

- GET /api/admin/lawyers, /api/admin/users, /api/admin/feedback
- PUT /api/admin/lawyers/[lawyerId]/verify, /api/admin/users/[userId]/suspend, /api/admin/feedback/[feedbackId]/moderate
