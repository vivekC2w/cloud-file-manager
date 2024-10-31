# Cloud File Manager with OAuth2 Authentication

## Project Setup and Run Guide

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (Node package manager)
- **MongoDB** (local or cloud instance)
- **AWS SDK** (for S3 integration)

### Step 1: Clone the Repository

Clone the project repository from GitHub:

```bash
git clone <repository-url>
cd <project-directory>
```
Step 2: Install Dependencies
Navigate to the project directory and install the required dependencies:
```bash
npm install
```
Step 3: Set Up Environment Variables
Create a .env file in the root of your project directory. This file will hold all your environment variables. Here’s a template for what your .env file might look like:

# MongoDB Configuration
MONGO_URI=mongodb://<username>:<password>@localhost:27017/<database-name>

# AWS S3 Configuration
S3_BUCKET_NAME=<your-s3-bucket-name>
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_REGION=<your-region>

# OAuth2 Configuration
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret

Explanation of Environment Variables
MONGO_URI: The connection string for your MongoDB database.
S3_BUCKET_NAME: The name of your S3 bucket where files will be stored.
AWS_ACCESS_KEY_ID: Your AWS access key ID for authentication.
AWS_SECRET_ACCESS_KEY: Your AWS secret access key for authentication.
AWS_REGION: The AWS region where your S3 bucket is located (e.g., us-east-1).
GOOGLE_CLIENT_ID: The client ID obtained from the Google Developer Console for OAuth2 authentication.
GOOGLE_CLIENT_SECRET: The client secret obtained from the Google Developer Console.
GOOGLE_CALLBACK_URL: The callback URL for OAuth2, which should match the settings in your Google Developer Console.
SESSION_SECRET: A secret key for session management.
Step 4: Run the Project
After setting up your environment variables, start the server using the following command:

```bash
npm start
```

The server will start running on http://localhost:3000.

Step 5: Access the Application
Open your web browser and navigate to http://localhost:3000. From there, you can log in using the OAuth2 authentication method provided (Google).

Important Notes
Ensure your MongoDB instance is running and accessible using the provided connection string.
For Google OAuth2, make sure you have configured your OAuth consent screen and added the necessary redirect URIs in your Google Developer Console.
Step 6: Testing API Endpoints
You can use Postman or any API client to test the following endpoints:

Login
Endpoint: GET /auth/login
Description: Redirects to Google OAuth.
Google Callback
Endpoint: GET /auth/google/callback
Description: Handles authentication.
File Management
Base URL: http://localhost:3000/files

###Upload a File

Endpoint: POST /upload
Description: Uploads a file to the S3 bucket and saves its metadata in the database.
Request Body:
file: The file to be uploaded (use FormData in Postman).
folderId (optional): The ID of the folder to associate the file with.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
POST http://localhost:3000/files/upload
Cookie: connect.sid=<your_cookie_value>
```

Download a File

Endpoint: GET /download/:id
Description: Downloads a specific file by its ID.
URL Parameters:
id: The ID of the file to be downloaded.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
GET http://localhost:3000/files/download/<file_id>
Cookie: connect.sid=<your_cookie_value>
```

Delete a File

Endpoint: DELETE /delete/:id
Description: Deletes a specific file by its ID from both S3 and the database.
URL Parameters:
id: The ID of the file to be deleted.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
DELETE http://localhost:3000/files/delete/<file_id>
Cookie: connect.sid=<your_cookie_value>
```

###Folder Management
Base URL: http://localhost:3000/folders

Create a New Folder

Endpoint: POST /create
Description: Creates a new folder in the database and initializes a corresponding folder in the S3 bucket.
Request Body:
folderName: The name of the folder to be created (required).
parentFolderId: The ID of the parent folder (optional).
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
POST http://localhost:3000/folders/create
Cookie: connect.sid=<your_cookie_value>
```

Get Contents of a Specific Folder

Endpoint: GET /contents/:id
Description: Retrieves the contents (files and subfolders) of a specific folder.
URL Parameters:
id: The ID of the folder whose contents are to be retrieved.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
GET http://localhost:3000/folders/contents/<folder_id>
Cookie: connect.sid=<your_cookie_value>
```

Download a Folder as a Zip File

Endpoint: GET /download-folder/:id
Description: Downloads the contents of a specific folder as a ZIP file.
URL Parameters:
id: The ID of the folder to be downloaded as a ZIP.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
GET http://localhost:3000/folders/download-folder/<folder_id>
Cookie: connect.sid=<your_cookie_value>
```

Delete a Specific Folder and Its Contents

Endpoint: DELETE /delete/:id
Description: Deletes a specific folder and its associated files and subfolders from both the database and S3.
URL Parameters:
id: The ID of the folder to be deleted.
Headers:
Cookie: connect.sid=<your_cookie_value>
Example Request:
```bash
DELETE http://localhost:3000/folders/delete/<folder_id>
Cookie: connect.sid=<your_cookie_value>
```

###How to Test with Postman
Set Up Cookie:

Go to the Headers tab in Postman.
Add a new key called Cookie with the value set to connect.sid=<your_cookie_value>.
Testing Upload File:

Select POST method.
Set the URL to http://localhost:3000/files/upload.
Go to the Body tab and select form-data.
Add a key called file and select a file from your system.
Optionally, add folderId if needed.
Click Send.
Testing Download File:

Select GET method.
Set the URL to http://localhost:3000/files/download/<file_id> (replace <file_id> with the actual file ID).
Click Send.
Testing Delete File:

Select DELETE method.
Set the URL to http://localhost:3000/files/delete/<file_id> (replace <file_id> with the actual file ID).
Click Send.
Testing Create Folder:

Select POST method.
Set the URL to http://localhost:3000/folders/create.
Go to the Body tab and select raw.
Choose JSON format and enter the request body as shown above.
Click Send.

