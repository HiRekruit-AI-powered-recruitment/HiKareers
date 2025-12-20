# Career-page Execution Plan

## Overview
This module handles:
- Job applications by users
- Resume upload & storage
- Preventing duplicate applications
- HR review & status updates (just fields in application schema)
- Preparing data for AI shortlisting (just fields in application schema)

## Scope (For now)
Collect, store, and manage application data correctly.  
This module will be integrated later with the main project.

## Tech Stack
**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Cloudinary  

**Frontend:**
- React.js
- Tailwind CSS
- Fetch API

## Backend Structure
## Data Model

### `applications` Collection
- `id`: ObjectId (Primary Key)
- `jobId`: ObjectId (Reference to job posting)
- `userId`: ObjectId (Reference to user)
- `resumeUrl`: String (Cloudinary URL)
- `currentStatus`: String  
  Values: `["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "WITHDRAWN"]`  
  Default: `APPLIED`
- `statusLogs`: Array of Objects *(to be implemented later)*  
  Each object contains:
  - `status`: String
  - `updatedAt`: DateTime
  - `updatedBy`: ObjectId (Reference to HR user or system)
- `aiScore`: Number (AI shortlisting score)  
  Default: `null`
- `rejectionReason`: String  
  Default: `null`
- `resumePublicId`: String (Cloudinary public ID for resume)
- `updatedAt`: DateTime
- `createdAt`: DateTime

## Constraints & Validations

- **Unique application per user per job**  
  `{ userId: 1, jobId: 1 }` unique index  
  Ensure one user can apply to a job only once. Handles double clicks or mistakes.  

  **Implementation plan:**  
  When creating a document, if a unique index violation occurs, return an error indicating the user has already applied.  
  This should also be handled in the main job-preview module to show an update button instead of apply.

- **Resume must be PDF/DOCX and ≤ 5MB**  
  Validate file type and size using Multer middleware.

- **Status must be one of predefined values**  
  Default: `APPLIED` on creation.

- **aiScore between 0–100 or null**  
  `null` indicates not yet scored by AI.

- **rejectionReason can be null or non-empty string**  
  `null` indicates not rejected yet.

## Query Indexes

- `{ userId: 1, createdAt: -1 }`  
  For user-specific application history retrieval and sorting.

- `{ jobId: 1, currentStatus: 1, createdAt: -1 }`  
  For HR to filter by job and status and sort efficiently.

## User Permissions

- Users can create applications for jobs.
- Users can view their own application history.
- Users can update application only if:
  - `currentStatus === APPLIED`
  - and before job deadline.
- Users can withdraw application if status is:
  - `APPLIED`
  - `UNDER_REVIEW`
- HR can view and update application statuses for jobs they manage, but **cannot** edit user form data or resume.

## PDF Upload Flow

- Use Multer middleware to handle file uploads.
- Store resumes in Cloudinary for scalability and easy access.
- Save Cloudinary URL in `resumeUrl`.
- Flow:  
  User selects file → verify type and size → preview → upload → submit application.

### Why this flow?

We have three options:

1. **Frontend directly uploads to Cloudinary**  
   - User selects file → upload → get URL → save in application.  
   - ❌ Leads to unnecessary uploads/deletes if user changes file.

2. **Backend uploads before application creation**  
   - User selects file → preview → backend uploads → frontend stores URL → create application.  
   - ✅ Better control.  
   - ❌ May cause orphan files if application not submitted.

3. **Upload with application submission (Chosen)**  
   - User selects file → preview → submit → backend uploads + creates application.  
   - ✅ No orphan files, fewer API calls.  
   - ❌ Slightly longer wait on submit and full failure if upload fails.

**Chosen Approach:** Option 3, for simplicity for now.

## Environment Variables (`.env`)

env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://user:{password}@cluster.mongodb.net/{hiring_app}

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


API ENDPOINTS:

    POST /api/applications
        - Create a new job application.
        - Validate unique application per user per job.
        - Handle resume upload to Cloudinary.
        - Request Body: { jobId, resumeFile }, userId from auth token
        - Response: Created application document or error.
        - Expected Status Codes:
            - 201 Created: Application created successfully.
            - 400 Bad Request: Invalid input data or file.
            - 409 Conflict: Duplicate application detected.

    GET /api/applications/me
        - Retrieve all applications for a specific user.
        - Response: List of application documents, [] for no applications.
        - Request Params: userId from auth token
        - Expected Status Codes:
            - 200 OK: Applications retrieved successfully.
            - 404 Not Found: Resource does not exist.

    GET /api/applications/job/:jobId
        - Retrieve all applications for a specific job (HR use).
        - Response: List of application documents, [] for no applications.
        - Expected Status Codes:
            - 200 OK: Applications retrieved successfully.
            - 404 Not Found:  Resource does not exist.

    PATCH /api/applications/:applicationId/status
        - Update the status of an application (HR use).
        - Validate status transitions.
        - Request Body: { newStatus}, updatedBy from auth token
        - Response: Updated application document or error.
        - Expected Status Codes:
            - 200 OK: Application status updated successfully.
            - 400 Bad Request: Invalid status transition. (Not Implemented now, not sure of this requirement)
            - 404 Not Found:  Resource does not exist.

    GET /api/applications/:applicationId
        - Retrieve a specific application by ID.
        - Response: Application document.
        - Expected Status Codes:
            - 200 OK: Application retrieved successfully.
            - 404 Not Found:  Resource does not exist.


Other Response Codes to handle:
    - 500 Internal Server Error: For unexpected server errors.
    - 401 Unauthorized: If user is not authenticated (to be handled in main project). (To be handled in main project)
    - 403 Forbidden: If user tries to access/update applications they don't have permission for. (Handled by verifyHR middleware for HR routes)

Extra Instructions: 
    - Store resume with name {userId}.pdf to easily identify resumes.
    - Cloudinary folder structure: /resumes/{job_id}/{userId}.pdf (This helps in easy debugging and overwrite on re-upload, avoid file_name conflicts, and only one resume per user per job also only one possible orphan file per user per job)
    - On unique index violation (Mongo error code 11000), API returns 409 Conflict.

------------------------------------------------------------------------------------------------------------------------------

## Frontend Structure