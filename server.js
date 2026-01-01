const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// We will move these to separate controllers later if huge, but for now inline is fine for speed
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', page: 'home' });
});

app.get('/services', (req, res) => {
    res.render('services', { title: 'Services', page: 'services' });
});

app.get('/capabilities', (req, res) => {
    res.render('capabilities', { title: 'Capabilities', page: 'capabilities' });
});



app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us', page: 'about' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact', page: 'contact' });
});

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Email Logic
const nodemailer = require('nodemailer');
require('dotenv').config();

app.post('/contact', async (req, res) => {
    const { name, email, project_type, message } = req.body;

    // Setup Transporter (User must configure .env)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
            pass: process.env.EMAIL_PASS  // e.g., your-app-password
        }
    });

    try {
        // 1. Send to Admin (Laminar Circuits)
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'pruthvicv77@gmail.com',
            subject: `New Inquiry from ${name} - ${project_type}`,
            text: `Name: ${name}\nEmail: ${email}\nProject: ${project_type}\nMessage:\n${message}`
        });

        // 2. Auto-reply to User
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'We received your inquiry - Laminar Circuits',
            text: `Hello ${name},\n\nThank you for contacting Laminar Circuits. We’ve received your message and will get back to you shortly.\n\nBest Regards,\nLaminar Circuits Team`
        });

        // Success Response (Simple redirect or message)
        res.send('<script>alert("Message sent successfully!"); window.location.href="/";</script>');
    } catch (error) {
        console.error("Email Error:", error);
        // Fallback if no credentials setup (Demo Mode)
        if (!process.env.EMAIL_USER) {
            console.log("DEMO MODE: Email would be sent here if credentials were provided.");
            res.send('<script>alert("Message received (Demo Mode - No Email Sent)"); window.location.href="/";</script>');
        } else {
            res.status(500).send("Error sending email.");
        }
    }
});

app.listen(port, () => {
    console.log(`Laminar Circuits server running at http://localhost:${port}`);
});
