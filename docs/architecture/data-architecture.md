# Data Architecture (MongoDB)

## Collections and Document Structures

### `users` Collection

Represents platform users (citizens, lawyers, admins).

```json
{
  "_id": ObjectId, // MongoDB's unique identifier for the user
  "email": String, // Unique, indexed
  "password": String, // Hashed password
  "fullName": String,
  "phone": String,
  "role": String, // "citizen", "lawyer", or "admin"
  "barCouncilId": String, // Optional, for lawyers
  "emailVerified": Boolean, // To track email verification status
  "suspended": Boolean, // For admin management
  "createdAt": Date,
  "updatedAt": Date
}
```

### `lawyerProfiles` Collection

Stores detailed professional profiles for lawyers.

```json
{
  "_id": ObjectId, // Can be the same as the corresponding user's _id if 1-to-1
  "userId": ObjectId, // Reference to the users collection
  "bio": String,
  "specialties": [String], // Array of strings for multiple specialties
  "experience": Number, // Years of experience
  "photoUrl": String, // GridFS file ID for the stored profile photo
  "availability": String, // Or a more complex embedded document/array for detailed schedules
  "fees": Number, // Consultation fees
  "verified": Boolean, // Admin verification status
  "createdAt": Date,
  "updatedAt": Date
}
```

### `appointments` Collection

Manages appointments booked between citizens and lawyers.

```json
{
  "_id": ObjectId,
  "lawyerId": ObjectId, // Reference to the users collection (lawyer)
  "citizenId": ObjectId, // Reference to the users collection (citizen)
  "appointmentDate": Date,
  "appointmentTime": String, // Or Date object for full timestamp
  "duration": Number, // In minutes
  "notes": String,
  "status": String, // "pending", "accepted", "rejected", "completed"
  "createdAt": Date,
  "updatedAt": Date
}
```

### `caseDocuments` Collection

Stores metadata for case-related documents, with files stored in GridFS.

```json
{
  "_id": ObjectId,
  "ownerId": ObjectId, // Reference to the users collection
  "sharedWithId": ObjectId, // Optional, reference to the users collection
  "fileId": ObjectId, // GridFS file ID
  "fileName": String,
  "fileSize": Number, // In bytes
  "fileType": String,
  "description": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### `feedback` Collection

Records user feedback and ratings for lawyers.

```json
{
  "_id": ObjectId,
  "lawyerId": ObjectId, // Reference to the users collection (lawyer)
  "citizenId": ObjectId, // Reference to the users collection (citizen)
  "appointmentId": ObjectId, // Reference to the appointments collection
  "rating": Number, // 1-5 stars
  "reviewText": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

## GridFS Buckets

- `profileImages`: Stores lawyer profile photos.
- `documents`: Stores case-related documents.