const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000; // Change this to your desired port

// Function to load existing scores from JSON file
function loadScores() {
    const file = 'scores.json';
    if (fs.existsSync(file)) {
        const json = fs.readFileSync(file);
        return JSON.parse(json);
    } else {
        return {};
    }
}

// Function to save scores to JSON file
function saveScores(scores) {
    const file = 'scores.json';
    const json = JSON.stringify(scores, null, 4);
    fs.writeFileSync(file, json);
}

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to get scores
app.get('/get_scores', (req, res) => {
    const scores = loadScores();
    res.json(scores);
});

// Endpoint to write score
app.get('/write_score/:username/:gameName/:score', (req, res) => {
    const { username, gameName, score } = req.params;
    const scores = loadScores();
    
    if (!scores[username]) {
        scores[username] = {};
    }
    scores[username][gameName] = parseInt(score);

    saveScores(scores);

    res.send("Scores saved successfully!");
});

// Handle invalid endpoints
app.use((req, res) => {
    res.status(404).send("Not Found");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
