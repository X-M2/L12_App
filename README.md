# 🤫 Silent Classroom Q&A

An anonymous Q&A web app for classrooms. Students ask questions without fear of judgment; teachers manage and answer them in real time.

## Features

| Feature | Who |
|---|---|
| Create a class session with a PIN | Teacher |
| Join class via 5-letter code | Student |
| Post anonymous questions | Student |
| Upvote questions | Student |
| Mark questions as answered | Teacher |
| Delete individual questions | Teacher |
| Clear all answered questions | Teacher |
| Auto-refresh every 10–15s | Both |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
# or
node app.js
```

The app runs at **http://localhost:3000**

## How to use

1. **Teacher** goes to `/`, enters a PIN → gets a class code
2. **Teacher** shares the 5-letter code with students
3. **Students** go to `/`, enter the code → join the classroom
4. Students post questions anonymously
5. Teacher sees all questions on the teacher dashboard, can mark answered or delete

## File Structure

```
silent-qa/
├── app.js              ← Express server + ALL routes
├── package.json
├── views/
│   ├── home.ejs        ← Landing page (join / create)
│   ├── classroom.ejs   ← Student Q&A view
│   ├── teacher.ejs     ← Teacher dashboard
│   └── error.ejs       ← Invalid class code page
└── public/
    └── css/
        └── style.css   ← Custom styles (Bootstrap + extras)
```

## Notes

- No database — all data is stored in memory (resets on server restart)
- No login system — teacher PIN is used for authentication
- Built with Express + EJS + Bootstrap 5
