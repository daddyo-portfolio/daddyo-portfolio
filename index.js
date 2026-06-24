const express = require('express');
const path = require('path');
// NEW: Import Node's native File System module
const fs = require('fs'); 
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 1. POST ROUTE: Handles incoming form submissions from clients
app.post('/submit-order', (req, res) => {
    const { clientName, designType, projectDetails } = req.body;

    // Create a structured string with a timestamp
    const timestamp = new Date().toLocaleString();
    const orderLogEntry = `
[${timestamp}] 
Client Name: ${clientName}
Design Type: ${designType}
Project Details: ${projectDetails}
---------------------------------------------
`;

    // Updated to public/orders.txt so it matches your dashboard path
    fs.appendFile('public/orders.txt', orderLogEntry, (err) => {
        if (err) {
            console.error("Error saving order to database file:", err);
            return res.status(500).send("Server Error processing your request.");
        }
        
        console.log(`Saved new order from ${clientName} to orders.txt database!`);
        
        // Render the browser confirmation page
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4f46e5;">Thank you, ${clientName}!</h1>
                <p>Your order request for a <strong>${designType}</strong> has been secured permanently.</p>
                <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: bold;">← Back to Home</a>
            </div>
        `);
    });
});

// 2. GET ROUTE: Added right here to view all incoming orders
app.get('/admin/dashboard', (req, res) => {
    // Read the text file from the public folder
    fs.readFile('public/orders.txt', 'utf8', (err, data) => {
        if (err) {
            // If the file doesn't exist yet, show a clean message
            return res.send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #4f46e5;">Admin Dashboard</h1>
                    <p>No design orders have been placed yet!</p>
                    <a href="/">Go to Homepage</a>
                </div>
            `);
        }

        // Convert line breaks into HTML break tags (<br>) so it formats nicely in the browser
        const formattedData = data.replace(/\n/g, '<br>');

        // Send a cleanly styled layout displaying the log contents
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Daddyo Graphics - Admin Dashboard</title>
                <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body class="bg-gray-900 text-gray-100 font-sans p-8">
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                        <h1 class="text-3xl font-bold text-indigo-400">Daddyo Graphics Control Panel</h1>
                        <a href="/" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium text-sm transition">View Live Site</a>
                    </div>
                    
                    <h2 class="text-xl font-semibold text-gray-300 mb-4">Incoming Client Orders Log:</h2>
                    
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl font-mono text-sm leading-relaxed overflow-x-auto text-green-400">
                        ${formattedData}
                    </div>
                </div>
            </body>
            </html>
        `);
    });
});

// 3. LISTEN BLOCK: Always stays at the absolute bottom of the file
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});