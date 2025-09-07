const express = require("express");
const Result = require("../models/Result");

const router = express.Router();
router.get("/progress", async (req, res) => {
        res.render("progress");
});
// 📌 User-specific history
router.get("/history", async (req, res) => {
    try {
        // check login
        if (!req.session.user) {
            return res.redirect("/api/auth/login");
        }

        const userId = req.session.user.id;

        // fetch only results of this user
        const results = await Result.find({ userId }).sort({ createdAt: -1 });

        res.render("history", { results, user: req.session.user });
    } catch (err) {
        console.error("History error:", err);
        res.send("Error loading history");
    }
});

// 📌 User-specific result detail
router.get("/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/api/auth/login");
        }

        const userId = req.session.user.id;

        // fetch only if result belongs to user
        const result = await Result.findOne({ _id: req.params.id, userId });
        if (!result) {
            return res.send("Result not found or not authorized");
        }

        res.render("resultDetail", { result, user: req.session.user });
    } catch (err) {
        console.error("Result detail error:", err);
        res.send("Error loading result");
    }
});
router.get('/quiz-history', async (req, res) => {
    // try {
    //     if (!req.session.user) {
    //         return res.status(401).json({ success: false, message: 'Please log in.' });
    //     }

    //     const userId = req.session.user.id;
        
    //     // Find all results for the user that have a quiz score
    //     const quizResults = await Result.find({ 
    //         userId: userId, 
    //         score: { $exists: true } 
    //     }).sort({ createdAt: 1 });

    //     // Extract the data points needed for the graph
    //     const dataForChart = quizResults.map((result, index) => ({
    //         quizId: result._id,
    //         score: result.score,
    //         total: result.total,
    //         label: `Quiz ${index + 1}`
    //     }));

    //     res.status(200).json({ success: true, data: dataForChart });

    // } catch (err) {
    //     console.error('Error fetching quiz history:', err);
    //     res.status(500).json({ success: false, message: 'Failed to fetch quiz history.' });
    // }
    res.render("progress");
});

// 📌 User-specific progress

module.exports = router;
