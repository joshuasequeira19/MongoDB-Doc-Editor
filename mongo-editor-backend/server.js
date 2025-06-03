// server.js

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

require("dotenv").config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 5001; // Use port from .env or default to 5001

// Middleware
//app.use(cors()); // Enable Cross-Origin Resource Sharing

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);

app.use(express.json()); // To parse JSON request bodies

// MongoDB Connection URI and Database Name from .env file
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DATABASE_NAME;

if (!mongoUri || !dbName) {
  console.error(
    "FATAL ERROR: MONGO_URI and DATABASE_NAME must be defined in your .env file."
  );
  process.exit(1); // Exit if essential config is missing
}

let db;

// Connect to MongoDB
MongoClient.connect(mongoUri)
  .then((client) => {
    console.log("Successfully connected to MongoDB");
    db = client.db(dbName); // Use the specified database

    // Start the server only after successful DB connection
    app.listen(port, () => {
      console.log(`Backend server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit if DB connection fails
  });

// --- API Endpoints ---

// Test endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the MongoDB Editor Backend API!" });
});

// Get all collection names
app.get("/api/collections", async (req, res) => {
  if (!db) {
    return res
      .status(503)
      .json({ error: "Database not connected. Please try again later." });
  }
  try {
    const collections = await db.listCollections().toArray();
    res.json(collections.map((col) => ({ name: col.name }))); // Send only names
  } catch (error) {
    console.error("Error fetching collections:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch collections", details: error.message });
  }
});

// Get a specific document by ID from a collection
app.get("/api/documents/:collectionName/:documentId", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not connected." });
  }
  const { collectionName, documentId } = req.params;
  if (!ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: "Invalid Document ID format." });
  }

  try {
    const collection = db.collection(collectionName);
    const document = await collection.findOne({
      _id: new ObjectId(documentId),
    });
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({
        error: `Document with ID '${documentId}' not found in collection '${collectionName}'.`,
      });
    }
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}:`, error);
    res
      .status(500)
      .json({ error: "Failed to fetch document", details: error.message });
  }
});

// Update a specific document by ID in a collection
app.put("/api/documents/:collectionName/:documentId", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not connected." });
  }
  const { collectionName, documentId } = req.params;
  const updatedDocData = req.body;

  if (!ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: "Invalid Document ID format." });
  }

  // Important: Remove _id from the update payload if present, as it cannot be changed.
  // MongoDB handles _id immutability. If you send _id in the update body, it might cause issues or be ignored.
  // For simplicity, we assume the client sends the whole document, including _id.
  // A more robust approach would be to use $set operator with specific fields.
  // However, for a direct editor, replacing the document (minus _id) is common.
  delete updatedDocData._id; // Ensure _id is not part of the update operation itself

  try {
    const collection = db.collection(collectionName);
    const result = await collection.replaceOne(
      { _id: new ObjectId(documentId) },
      updatedDocData // The new document content (without _id in the $set part)
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: `Document with ID '${documentId}' not found in collection '${collectionName}' for update.`,
      });
    }
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      // This can happen if the submitted data is identical to the existing data.
      return res.json({
        message: "Document found but no changes were made.",
        document: await collection.findOne({ _id: new ObjectId(documentId) }),
      });
    }

    // Fetch the updated document to return it
    const updatedDocument = await collection.findOne({
      _id: new ObjectId(documentId),
    });
    res.json({
      message: "Document updated successfully.",
      document: updatedDocument,
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    res
      .status(500)
      .json({ error: "Failed to update document", details: error.message });
  }
});

// Delete a specific document by ID from a collection
app.delete("/api/documents/:collectionName/:documentId", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not connected." });
  }
  const { collectionName, documentId } = req.params;

  if (!ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: "Invalid Document ID format." });
  }

  try {
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne({
      _id: new ObjectId(documentId),
    });

    if (result.deletedCount === 1) {
      res.json({ message: "Document deleted successfully." });
    } else {
      res.status(404).json({
        error: `Document with ID '${documentId}' not found in collection '${collectionName}' for deletion.`,
      });
    }
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    res
      .status(500)
      .json({ error: "Failed to delete document", details: error.message });
  }
});

// Basic error handling for unhandled routes (optional)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested URL ${req.originalUrl} was not found on this server.`,
  });
});

// Global error handler (optional, for more centralized error management)
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", details: err.message });
});
