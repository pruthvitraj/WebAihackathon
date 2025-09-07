const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js"); // OCR for images
const pdfParse = require("pdf-parse"); // PDF parser
const mammoth = require("mammoth"); // DOCX parser
const Note = require("../models/Note");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// GET upload page
router.get("/", (req, res) => {
    res.render("upload", { error: null, user: req.session.user || null });
});

// POST upload file
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.render("upload", { error: "No file uploaded", user: req.session.user || null });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        let extractedText = "";

        if ([".jpg", ".jpeg", ".png"].includes(ext)) {
            // 🖼 OCR for images
            const result = await Tesseract.recognize(req.file.path, "eng");
            extractedText = result.data.text;
        } else if (ext === ".txt") {
            // 📄 plain text
            extractedText = fs.readFileSync(req.file.path, "utf-8");
        } else if (ext === ".pdf") {
            // 📑 PDF parsing
            const pdfBuffer = fs.readFileSync(req.file.path);
            const result = await pdfParse(pdfBuffer);
            extractedText = result.text;
        } else if (ext === ".docx") {
            // 📝 DOCX parsing
            const result = await mammoth.extractRawText({ path: req.file.path });
            extractedText = result.value;
        } else {
            extractedText = "Unsupported file type.";
        }

        const newNote = new Note({
            userId: req.body.userId || (req.session.user ? req.session.user.id : null),
            fileName: req.file.filename,
            extractedText
        });

        await newNote.save();

        res.redirect(`/api/generate?noteId=${newNote._id}&title=${req.body.title || "Untitled"}`);

    } catch (err) {
        console.error("Upload error:", err);
        res.render("upload", { error: "Upload failed", user: req.session.user || null });
    }
});

module.exports = router;
