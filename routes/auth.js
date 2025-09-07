const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { log } = require("console");

const router = express.Router();

// Render signup page
router.get("/login", (req, res) => {
    res.render("login"); // renders views/login.ejs
});

router.get("/signup", (req, res) => {
    res.render("register"); // renders views/signup.ejs
});
// Signup
router.post("/signup", async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, name, email, password: hashedPassword });
        await user.save();
        res.render("login");
    } catch (err) {
        // Handle specific duplicate key errors more gracefully
        if (err.code === 11000) {
            res.status(409).json({ error: "Username or email already exists." });
        } else {
            res.status(400).json({ error: "Signup failed", details: err.message });
        }
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        let username = email.split('@')[0];
        const user = await User.findOne({ email });
        console.log("Login attempt for user:", user);

        if (!user) {
            return res.render("login", { error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Invalid password" });
        }

        req.session.user = { id: user._id, name: user.name };
        res.render("Home", { user: username || null });
    } catch (err) {
        console.error("Login error:", err);
        res.render("login", { error: "Login failed. Try again." });
    }
});

router.post('/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid'); // Optional: clear cookie
        res.redirect('/'); // Redirect to home page
    });
});

        
// });

module.exports = router;
