# MongoDB Editor

A web-based MongoDB database editor that allows you to view, edit, and manage your MongoDB collections through an intuitive interface.

## Project Structure

```
mongo-editor/
├── frontend/           # Frontend application
│   └── index.html
├── mongo-editor-backend/   # Backend API server
│   ├── server.js
│   ├── package.json
│   ├── .env (create this)
│   └── ...
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or remote)
- Live Server extension (for VS Code) or any static file server

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd mongo-editor-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an `.env` file in the `mongo-editor-backend` directory with the following content:

   ```env
   MONGO_URI=mongodb://<username>:<password>@<host>:<port>/<db-name>?authSource=admin&directConnection=true
   DATABASE_NAME=<db-name>
   PORT=5001
   ```

   **Example configuration:**

   ```env
   MONGO_URI=mongodb://admin:password123@localhost:27017/myapp?authSource=admin&directConnection=true
   DATABASE_NAME=myapp
   PORT=5001
   ```

4. Replace the placeholders with your actual MongoDB connection details:

   - `<username>`: Your MongoDB username
   - `<password>`: Your MongoDB password
   - `<host>`: MongoDB host (e.g., localhost, your server IP)
   - `<port>`: MongoDB port (default: 27017)
   - `<db-name>`: Your database name

5. Start the backend server:

   ```bash
   node server.js
   ```

   You should see a message indicating the server is running on port 5001.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Start a local development server using one of these methods:

   **Option 1: VS Code Live Server**

   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"

   **Option 2: Python HTTP Server**

   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option 3: Node.js HTTP Server**

   ```bash
   npx http-server -p 8000
   ```

3. Open your browser and navigate to `http://localhost:8000` (or the port shown by Live Server)

## Usage

1. Ensure both backend and frontend servers are running
2. Open the frontend application in your browser
3. The application will connect to your MongoDB database through the backend API
4. You can now view, edit, and manage your MongoDB collections

## Configuration Notes

- The backend runs on port 5001 by default
- Make sure your MongoDB instance is accessible with the provided credentials
- If using MongoDB Atlas, replace the connection string format accordingly
- The `authSource=admin` parameter specifies the authentication database
- The `directConnection=true` parameter is useful for direct connections to MongoDB instances

## Troubleshooting

### Common Issues

1. **Connection refused errors**: Ensure MongoDB is running and accessible
2. **Authentication failed**: Verify username, password, and authSource in the connection string
3. **CORS errors**: The backend should handle CORS, but ensure both servers are running
4. **Port conflicts**: Change the PORT value in `.env` if port 5001 is already in use
