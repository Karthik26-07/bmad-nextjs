# Security Architecture

## Access Control

- NextAuth.js manages sessions + JWT
- Role-based access control implemented in API routes
- Lawyer profiles editable only by lawyer or admin
- Admin-only API access guarded via session checks
- GridFS for secure document storage and serving
