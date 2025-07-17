# Project Structure

## Application Layout

```
legalconnect/
├── app/
│   ├── auth/ (login, register)
│   ├── dashboard/ (citizen/lawyer dashboards)
│   ├── lawyers/ (search, profile view)
│   ├── admin/ (admin panel routes)
│   └── api/ (REST endpoints)
├── components/
├── lib/ (mongodb, gridfs, utils)
├── hooks/ (useSession, useAppointments)
├── constants/ (roles, routes)
├── middleware.ts
├── tailwind.config.ts
├── .env.local
```
