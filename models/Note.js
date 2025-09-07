const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    userId: String,
    fileName: String,
    extractedText: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Note", NoteSchema);
