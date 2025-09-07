const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Result = require("./models/Result");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form POST requests
app.use(express.json());

const session = require("express-session");

app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true
}));

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS/JS)
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public")));


// Connect MongoDB
mongoose.connect(process.env.Database_url_atlas, {
// mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/generate", require("./routes/generate"));
app.use("/api/result", require("./routes/result"));
// app.use("/api/dashboard", require("./routes/dashboard"));
// app.use("/api/progress", require("./routes/progress"));
console.log("Session user:", app.request ? app.request.session : "No request object");
app.get("/api/dashboard", (req, res) => {
    console.log("Session user in dashboard:", req.session.user);

    res.render("dashboard", {
        user: req.session.user || null,
        summaries: [],       // No summaries yet
        flashcards: [],      // No flashcards yet
        quizzes: [],         // No quizzes yet
        history: [],         // No activity yet
        progress: null       // No progress yet
    });
});
app.get("/contact", (req, res) => {
    res.render("contact", { user: req.session.user || null });
});
// Start Server
app.get("/", (req, res) => {
   res.render("Home", { user: req.session.user || null });
});

app.post('/api/results/saveQuizResult', async (req, res) => {
    try {
        if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
        const { score, total, answers } = req.body;

        // Create a new Result document
        const quizResult = new Result({
            userId: req.session.user.id, // Assuming user is in session
            score,
            total,
            answers // The array of question/answer objects
        });

        // Save the document to the database
        await quizResult.save();

        res.status(200).json({ success: true, message: 'Quiz result saved successfully.' });
    } catch (error) {
        // res.redirect("/api/auth/login");
        console.error('Error saving quiz result:', error);
        res.status(500).json({ success: false, message: 'Failed to save quiz result.' });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
