const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true }, // unique per attempt
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  results: [
    {
      question: { type: String, required: true },
      answer: { type: String }, // user’s chosen answer
      correct: { type: String, required: true }
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional: link to user
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizResult", quizResultSchema);
