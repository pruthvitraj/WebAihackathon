const express = require("express");
const Note = require("../models/Note");
const Result = require("../models/Result");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Utility function to clean text
function cleanText(text) {
  return text
    .replace(/\*\*/g, "")        // remove all **
    .replace(/\r/g, "")          // remove carriage returns
    .replace(/\n{2,}/g, "\n")    // collapse multiple newlines
    .trim();                     // trim spaces
}

// ✅ Parse quizzes from Gemini text
function parseQuizzes(rawText) {
  const quizBlocks = rawText.split(/Question:/).filter(q => q.trim() !== "");
  return quizBlocks.map(block => {
    const [questionLine, ...rest] = block.trim().split("\n");

    const options = rest
      .filter(line => /^[a-d]\)/i.test(line.trim()))
      .map(line => line.replace(/^[a-d]\)\s*/, "").trim());

    const answerLine = rest.find(line => /^Answer:/i.test(line));
    const answer = answerLine ? answerLine.replace(/Answer:\s*/, "").trim() : "";

    return {
      q: questionLine ? questionLine.trim() : "",
      options,
      answer
    };
  });
}

router.get("/", async (req, res) => {
  if (!req.session.user) {
    req.session.error = "Please log in to access this page.";
    return res.redirect("/api/auth/login");
  }

  const { noteId, title } = req.query;
  if (!noteId) return res.send("Note ID is required");

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.send("Note not found");

    const text = note.extractedText || "";
    if (!text.trim()) return res.send("No text extracted from this file");

    // Gemini AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combined prompt
    const prompt = `
Please process the following text and provide three separate sections:

1. SUMMARY: A concise summary of the text.
2. FLASHCARDS: 5 Q&A flashcards, format each as "Q: ... A: ..."
3. QUIZZES: 5 multiple-choice questions, format each as "Question: ... a) ... b) ... c) ... d) ... Answer: ..."

Text:
${text}
`;

    const combinedRes = await model.generateContent(prompt);
    const combinedText = combinedRes.response.text();

    // ✅ Parse and clean sections
    let summary = "";
    let flashcards = "";
    let quizzes = "";
    let parsedQuizzes = [];

    const summaryMatch = combinedText.match(/SUMMARY:([\s\S]*?)FLASHCARDS:/);
    if (summaryMatch) summary = cleanText(summaryMatch[1]);

    const flashcardsMatch = combinedText.match(/FLASHCARDS:([\s\S]*?)QUIZZES:/);
    if (flashcardsMatch) flashcards = cleanText(flashcardsMatch[1]);

    const quizzesMatch = combinedText.match(/QUIZZES:([\s\S]*)/);
    if (quizzesMatch) {
      quizzes = cleanText(quizzesMatch[1]);
      parsedQuizzes = parseQuizzes(quizzes);
    }

    // ✅ Save cleaned result
    const result = new Result({
      noteId,
      userId: req.session.user.id,
      title: title || `Result for ${note.fileName}`,
      summary,
      flashcards,
      quizzes // keep raw text for reference
    });
    await result.save();

    // ✅ Render cleaned data with interactive quizzes
    res.render("dashboard", {
      user: req.session.user,
      summaries: [{ _id: result._id, title: result.title, text: result.summary }],
      flashcards: [result.flashcards],
      quizzes: parsedQuizzes, // interactive JSON quizzes
      history: [result],
      progress: {
        totalNotes: 1,
        totalSummaries: summary ? 1 : 0,
        totalFlashcards: flashcards ? 1 : 0,
        totalQuizzes: quizzes ? 1 : 0
      }
    });

  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).send("Error generating content");
  }
});

module.exports = router;
