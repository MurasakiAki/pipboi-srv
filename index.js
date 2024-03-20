const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Function to load existing scores from JSON file
function loadScores() {
    const file = '.scores.json';
    try {
        if (fs.existsSync(file)) {
            const json = fs.readFileSync(file);
            return JSON.parse(json);
        } else {
            return { users: [] };
        }
    } catch (err) {
        console.error('Error loading scores:', err);
        return { users: [] };
    }
}

// Function to save scores to JSON file
function saveScores(scores) {
    const file = '.scores.json';
    try {
        const json = JSON.stringify(scores, null, 4);
        fs.writeFileSync(file, json);
        console.log('Scores saved successfully!');
    } catch (err) {
        console.error('Error saving scores:', err);
    }
}

app.use(express.json());

// Endpoint to get scores
app.get('/get_scores', (req, res) => {
    const scores = loadScores();
    res.json(scores);
});

// Endpoint to write score
app.get('/write_score/:username/:gamename/:score', (req, res) => {
    const { username, gamename, score } = req.params;
    const scores = loadScores();
    
    // Find the user with the specified username
    const userIndex = scores.users.findIndex(user => user.user[0].username === username);
    if (userIndex !== -1) {
        // Check if the game already exists for the user
        const gameIndex = scores.users[userIndex].user[1].games.findIndex(game => game.gamename === gamename);
        if (gameIndex !== -1) {
            // Update the score for the existing game
            scores.users[userIndex].user[1].games[gameIndex].score = parseInt(score);
        } else {
            // Add the new game for the user
            scores.users[userIndex].user[1].games.push({ gamename, score: parseInt(score) });
        }
    } else {
        // Add a new user with the specified game
        scores.users.push({
            user: [
                { username },
                {
                    games: [
                        { gamename, score: parseInt(score) }
                    ]
                }
            ]
        });
    }

    saveScores(scores);

    // Broadcast scores to all connected clients
    io.emit('scoresUpdated', scores);

    res.json(scores);
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Handle invalid endpoints
app.use((req, res) => {
    res.status(404).send("Not Found");
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
