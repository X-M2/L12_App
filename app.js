const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── In-memory data store (no database) ──────────────────────────────────────
let classes = {};
// classes[code] = { code, teacherPin, questions: [] }
// question = { id, text, upvotes, answered, timestamp }

let questionIdCounter = 1;

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET / — Home Page
app.get("/", (req, res) => {
  res.render("home");
});

// POST /create — Teacher creates a class
app.post("/create", (req, res) => {
  const { teacherPin } = req.body;
  if (!teacherPin || teacherPin.trim() === "") {
    return res.render("home", { error: "Please enter a teacher PIN." });
  }
  const code = generateCode();
  classes[code] = { code, teacherPin: teacherPin.trim(), questions: [] };
  res.redirect(`/teacher/${code}?pin=${encodeURIComponent(teacherPin.trim())}`);
});

// POST /join — Student joins a class
app.post("/join", (req, res) => {
  const { classCode } = req.body;
  const code = classCode ? classCode.trim().toUpperCase() : "";
  if (!classes[code]) {
    return res.render("home", { joinError: `Class "${code}" not found.` });
  }
  res.redirect(`/class/${code}`);
});

// GET /class/:code — Student classroom page
app.get("/class/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  // Sort by upvotes descending, unanswered first
  const sorted = [...classroom.questions].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return b.upvotes - a.upvotes;
  });
  res.render("classroom", { code, questions: sorted });
});

// POST /class/:code/ask — Student posts a question
app.post("/class/:code/ask", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.redirect(`/class/${code}`);
  }

  classroom.questions.push({
    id: questionIdCounter++,
    text: question.trim(),
    upvotes: 0,
    answered: false,
    timestamp: new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }),
  });

  res.redirect(`/class/${code}`);
});

// POST /class/:code/upvote/:id — Student upvotes a question
app.post("/class/:code/upvote/:id", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const q = classroom.questions.find((q) => q.id === parseInt(req.params.id));
  if (q && !q.answered) q.upvotes++;

  res.redirect(`/class/${code}`);
});

// GET /teacher/:code — Teacher view page
app.get("/teacher/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const pin = req.query.pin || "";
  if (pin !== classroom.teacherPin) {
    return res.render("home", { joinError: "Invalid teacher PIN." });
  }

  const sorted = [...classroom.questions].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return b.upvotes - a.upvotes;
  });

  res.render("teacher", { code, pin, questions: sorted });
});

// POST /teacher/:code/answer/:id — Teacher marks question as answered
app.post("/teacher/:code/answer/:id", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const { pin } = req.body;
  if (pin !== classroom.teacherPin) return res.redirect("/");

  const q = classroom.questions.find((q) => q.id === parseInt(req.params.id));
  if (q) q.answered = true;

  res.redirect(`/teacher/${code}?pin=${encodeURIComponent(pin)}`);
});

// POST /teacher/:code/delete/:id — Teacher deletes a question
app.post("/teacher/:code/delete/:id", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const { pin } = req.body;
  if (pin !== classroom.teacherPin) return res.redirect("/");

  classroom.questions = classroom.questions.filter(
    (q) => q.id !== parseInt(req.params.id)
  );

  res.redirect(`/teacher/${code}?pin=${encodeURIComponent(pin)}`);
});

// POST /teacher/:code/clear — Teacher clears all answered questions
app.post("/teacher/:code/clear", (req, res) => {
  const code = req.params.code.toUpperCase();
  const classroom = classes[code];
  if (!classroom) return res.render("error", { code });

  const { pin } = req.body;
  if (pin !== classroom.teacherPin) return res.redirect("/");

  classroom.questions = classroom.questions.filter((q) => !q.answered);
  res.redirect(`/teacher/${code}?pin=${encodeURIComponent(pin)}`);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Silent Classroom Q&A running at http://localhost:${PORT}`);
});
