const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieSession = require('cookie-session');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Configure secure sessions
app.use(cookieSession({
    name: 'daddyo_session',
    keys: ['super-secret-security-key-change-this-anytime'],
    maxAge: 24 * 60 * 60 * 1000 // Session lasts for 24 hours
}));

// Admin hardcoded credentials (Change these to your preferred username/password!)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "DaddyoSecurePassword2026";

// GET: Render the Login Page
app.get('/admin/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Daddyo Admin - Login</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body class="bg-gray-900 flex items-center justify-center h-screen font-sans">
            <div class="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md">
                <h2 class="text-2xl font-bold text-center text-indigo-400 mb-6">Daddyo Control Panel</h2>
                <form action="/admin/login" method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300">Username</label>
                        <input type="text" name="username" required class="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300">Password</label>
                        <input type="password" name="password" required class="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 transition">
                        Login securely
                    </button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// POST: Handle Login Verification
app.post('/admin/login', (req, requireRes) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true; // Mark this browser session as logged in
        return requireRes.redirect('/admin/dashboard');
    } else {
        return requireRes.send(`
            <script>
                alert('Invalid Credentials! Access Denied.');
                window.location.href = '/admin/login';
            </script>
        `);
    }
});

// GET: Secure Admin Dashboard (Protected by session check)
app.get('/admin/dashboard', (req, res) => {
    // SECURITY GATE: Check if the user is authenticated
    if (!req.session || !req.session.isAdmin) {
        return res.redirect('/admin/login'); // Kick them out to login page if not
    }

    const filePath = path.join(__dirname, 'orders.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #111827; color: white; min-height:100vh;">
                    <h1 style="color: #4f46e5;">Admin Dashboard</h1>
                    <p>No design orders have been placed yet!</p>
                    <a href="/" style="color: #a5b4fc;">Go to Homepage</a>
                </div>
            `);
        }

        const formattedData = data.replace(/\n/g, '<br>');

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
                        <div class="space-x-2">
                            <a href="/" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium text-sm transition">View Live Site</a>
                            <a href="/admin/logout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm transition">Logout</a>
                        </div>
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

// GET: Handle Logout
app.get('/admin/logout', (req, res) => {
    req.session = null; // Clear cookie session tokens
    res.redirect('/admin/login');
});

// Handle order submission form
app.post('/submit-order', (req, res) => {
    const { clientName, designType, projectDetails } = req.body;
    const timestamp = new Date().toLocaleString();
    const orderLogEntry = `\n[${timestamp}]\nClient Name: ${clientName}\nDesign Type: ${designType}\nProject Details: ${projectDetails}\n---------------------------------------------\n`;

    const filePath = path.join(__dirname, 'orders.txt');

    fs.appendFile(filePath, orderLogEntry, (err) => {
        if (err) return res.status(500).send("Server Error processing request.");
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4f46e5;">Thank you, ${clientName}!</h1>
                <p>Your order request for a <strong>${designType}</strong> has been secured permanently.</p>
                <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: bold;">← Back to Home</a>
            </div>
        `);
    });
});

// Fallback port binding for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));