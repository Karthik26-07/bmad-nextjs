# Non-Functional Requirements

## Security

- All user passwords must be hashed using modern algorithms (e.g., bcrypt, Argon2)
- User sessions will expire after 30 minutes of inactivity
- All communication must occur over HTTPS (TLS 1.2 or higher)
- Lawyer and admin actions must be audit logged
- Document uploads will be encrypted at rest and in transit
- Role-based access control for all protected views and data
- Compliance with Indian IT Act, 2000 and IT Rules

## Performance

- Homepage and search should load in <2 seconds on a 4G mobile connection
- Appointment booking flow should complete in <800ms round trip
- Upload of a 5MB document should complete in <5 seconds
- Support 500 concurrent users at MVP phase, scalable to 10,000

## Scalability

- Modular backend design for future scaling
- Asynchronous queues for handling appointment confirmations and notifications
- CDN-enabled delivery for static content
- Horizontally scalable DB and app server architecture on cloud

## Device / Browser Support

- Minimum supported screen: 320px width
- Support latest 3 versions of Chrome, Firefox, Safari, Edge
- Graceful degradation for JS-disabled users (basic booking flow)
- Fully mobile-optimized design

## Compliance & Trust

- Data retention policy defined (default: 2 years unless legal request)
- Users can request data deletion (per IT Rules)
- Admin-only access to flagged documents or complaints
- Dispute handling within 5 business days
- Optional cookie consent banner
