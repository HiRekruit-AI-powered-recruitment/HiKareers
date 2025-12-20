# Career-page Execution plan 

Overview
    This module handles 
    - Job applications by users
    - Resume upload & storage
    - Preventing duplicate applications
    - HR review & status updates (Just fields in application schema)
    - Preparing data for AI shortlisting (Just fields in application schema)

Scope For now : 
    Collect, store, and manage application data correctly.
    This module will be integrated later with main project.

Tech stack : 
    Backend: Node.js, Express.js, MongoDB, Mongoose, Multer, Cloudinary
    Frontend: React.js, Tailwind CSS, Fetch API

Data Model:
    'applications' Collection:
        - id: ObjectId  (Primary Key)
        - jobId: ObjectId (Reference to job posting)
        - userId: ObjectId (Reference to user)
        - resumeUrl: String (Cloudinary URL)
        - currentStatus: String ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "WITHDRAWN"] default : 'APPLIED'
        - statusLogs: Array of Objects
            - Each object contains:
                - status: String
                - updatedAt: DateTime
                - updatedBy: ObjectId (Reference to HR user or system)
                (To be impelmented later)
        - aiScore: Number (AI shortlisting score) default : null   (Score given after Ai Screening)
        - rejectionReason: String default : null     (Reason for rejection if any : Either added by HR or AI)
        - resumePublicId: String (Cloudinary public ID for resume) (To delete/replace resume in Cloudinary)
        - updatedAt: DateTime
        - createdAt: DateTime


Constraints & Validations:
    - Unique application per user per job {userId : 1,  jobId : 1 } unique index
        Ensure one user can apply to a job only once also handles double clicks or by-mistake double applications.
        Implementation Plan : When accreting a document, if we get an error due to unique index violation, it means user has already applied  and we will show error. (this is just im-module extra check, however this much=t be handled at main job-preview module too, to show update button instead of apply if user has already applied)

    - Resume must be PDF/DOCX and <= 5MB 
        Validate file type and size during upload using Multer middleware.

    - Status must be one of the predefined values
        By default 'applied' on creation.

    - apiScore between 0-100 or null
        - null indicates not yet scored by AI.

    - rejectionReason can be null or non-empty string
        - null indicates not rejected yet.

Query Indexes:
    - { userId: 1, createdAt: -1 }  
        For performing user-specific application history retrieval and sorting efficiently.

    - { jobId: 1, currentStatus: 1, createdAt: -1 } 
        For HR to filter applications by job and status quickly and sort efficiently.

User Perpissions:
    - Users can create applications for jobs.
    - Users can view their own application history.
    - Update application only if:
        - currentStatus === APPLIED
        - and before job deadline
    - User can also withdraw application if currentStatus is [APPLIED, UNDER REVIEW] 
    - HR can view and update application statuses for jobs they manage, but Cannot edit user form data or resume


PDF Upload Flow:
    - Use Multer middleware to handle file uploads.
    - Store resumes in Cloudinary for scalability and easy access.
    - Save the Cloudinary URL in the resumeUrl field of the application document.
    - User selects file -> verify the file type and size -> Preview -> Show upload button for that file -> Upload on cloudinary using backend service -> save URL in frontend -> when user submits application, send URL to backend for saving in database.

    Why this flow?
        We have two options : 
            1. When user selects file -> directly upload to cloudinary from frontend -> get URL -> save in application document while creating application. (But if user selects wrong file or changes that, every time we will delete that file from cloudinary and upload new one, leading to and unnecessary API calls )
            2. When user selects file -> preview -> when user presses upload file, send file to backend -> backend uploads to cloudinary and saves URL in frontend -> create application document with that URL when user submits.
            It reduces unnecessary API calls to cloudinary and gives better control over the upload process. But it may cause to orphan files in cloudinary if user never submits application after uploading resume. This can be handled by a periodic cleanup job that deletes files not linked to any application after a certain time period. (TO BE HANDELED LATER)
            3. When user selects file -> preview -> And suplaod the pdf on cloudinary along with application submission when user clicks on submit button. This way we can avoid orphan files issue and also reduce unnecessary API calls to cloudinary. but this may lead to slightly longer wait time for user when submitting application as both file upload and application creation will happen together and also if file upload fails, application creation will also fail, and user may be required to reapply, bad user experience.
            
    - Chosen Approach: Option 3, for simlicity for now. (Can be changed later based on feedback)

Environment Variables (.env):
    NODE_ENV=development
    PORT=5000
    CLIENT_URL=http://localhost:5173

    MONGODB_URI=mongodb+srv://user:{password}@cluster.mongodb.net/{hiring_app}

    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    CLOUDINARY_MAX_FILE_SIZE=5242880  # 5MB in bytes
    CLOUDINARY_ALLOWED_FORMATS=pdf


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
    Store resume with name {userId}.pdf to easily identify resumes.
    Cloudinary folder structure: /resumes/{job_id}/{userId}.pdf (This helps in easy debugging and overwrite on re-upload, avoid file_name conflicts, and only one resume per user per job also only one possible orphan file per user per job)
    On unique index violation (Mongo error code 11000), API returns 409 Conflict.