const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  summary: String,
  flashcards: String,
  quizzes: String,
  // 👇 add these for quiz test results
  score: Number,
  total: Number,
  answers: [
    {
      question: String,
      selected: String,
      correct: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Result", ResultSchema);
