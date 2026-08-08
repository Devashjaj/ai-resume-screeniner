const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Test route
app.get('/', (req, res) => {
  res.send('AI Resume Screener Backend is running!');
});

// Resume screening API endpoint
app.post('/api/screen-resume', upload.single('resume'), (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription) {
    return res.status(400).json({ error: 'Resume file and Job Description are required.' });
  }

  // Yahan hum AI / Parsing logic implement karenge. 
  // Abhi ke liye ek smart mock response bhej rahe hain:
  setTimeout(() => {
    res.json({
      score: 92,
      status: 'Excellent Match',
      matchingSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js'],
      missingSkills: ['TypeScript', 'GraphQL'],
      summary: 'The candidate possesses strong core frontend skills and fits the job description well.'
    });
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});