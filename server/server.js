// Import required modules
import fs from 'fs';                            // File system module to read/write files
import express from 'express';                  // Express for creating the server
import cors from 'cors';                        // CORS to handle cross-origin requests
import bodyParser from 'body-parser';           // For parsing JSON in requests
import path from 'path';                        // Path utility for file paths
import { fileURLToPath } from 'url';            // Needed to get __dirname in ES Modules
import nodemailer from 'nodemailer';            // For sending emails
import dotenv from 'dotenv';                    // Load environment variables from .env

// Load environment variables from .env file
dotenv.config();

// Fix __dirname for ES modules (not available by default)
const __filename = fileURLToPath(import.meta.url);     // Get the file path of this module
const __dirname = path.dirname(__filename);            // Get the folder path of this module

// Define paths to data storage
const DATA_DIR = path.resolve(__dirname, 'data');                    // Folder for storing data
const QUOTES_FILE = path.resolve(DATA_DIR, 'quotes.json');          // JSON file for quotes

// Ensure the "data" directory and "quotes.json" file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });                    // Create the folder if it doesn't exist
}
if (!fs.existsSync(QUOTES_FILE)) {
    fs.writeFileSync(QUOTES_FILE, JSON.stringify({ quotes: [] }, null, 2));   // Create empty quotes array
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;                               // Use env port or default to 5000

// -----------------------------------
// Middleware Configuration
// -----------------------------------

// Allow requests from specific frontend origins (adjust as needed)

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yourfrontend.com'] // <-- Add your production domain here when ready
  : ['http://localhost:5500', 'http://127.0.0.1:5500']; // Dev environments

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type'
}));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the "public" folder
// This means when user visits "/", they'll get index.html from this folder
// Serve static files from the 'public' folder
app.use(express.static('public'));
// Serve static files (CSS, JS, images, etc.) from the "public" directory

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, '..', 'index.html'));
});


// -----------------------------------
// Email Configuration
// -----------------------------------

// Create a transporter for sending emails (using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,      // Your email (from .env)
        pass: process.env.EMAIL_PASS       // Your email password or app password (from .env)
    }
});

// -----------------------------------
// API Routes
// -----------------------------------

// 1️⃣ Route to submit a new quote request (POST)
app.post('/api/quote', (req, res) => {
    const { name, email, phone, message } = req.body;

    // Basic validation to make sure all fields are filled
    if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Read the current quotes from the file
    fs.readFile(QUOTES_FILE, (err, data) => {
        if (err) {
            console.error("Error reading quotes file:", err);
            return res.status(500).json({ error: "Server error" });
        }

        const quotes = JSON.parse(data || '{"quotes": []}');         // Parse existing quotes
        const newQuote = {
            name,
            email,
            phone,
            message,
            date: new Date().toISOString()
        };

        quotes.quotes.push(newQuote);                                // Add new quote to array

        // Save updated quotes array to file
        fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), (err) => {
            if (err) {
                console.error("Error writing quotes file:", err);
                return res.status(500).json({ error: "Could not save quote" });
            }

            // Prepare the email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.NOTIFY_EMAIL,                                               // Who should receive notifications
                subject: "New Quote Request Received",
                text: `New quote request from ${name} (${email}, ${phone}):\n\n${message}`
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Email send error:", error);
                    return res.status(500).json({ error: "Quote saved but email failed" });
                } else {
                    console.log("Email sent:", info.response);
                    res.status(201).json({ message: "Quote submitted and email sent!" });
                }
            });
        });
    });
});

// 2️⃣ Route to get all quotes (GET)
app.get('/api/quotes', (req, res) => {
    fs.readFile(QUOTES_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading quotes:", err);
            return res.status(500).json({ message: "Error reading quotes" });
        }

        const quotes = data ? JSON.parse(data) : { quotes: [] };
        res.json(quotes); // Send the array of quotes back to the client
    });
});



// -----------------------------------
// Start the Server
// -----------------------------------
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
