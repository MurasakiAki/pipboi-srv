<?php

// Function to load existing scores from JSON file
function loadScores() {
    $file = 'scores.json';
    if (file_exists($file)) {
        $json = file_get_contents($file);
        return json_decode($json, true);
    } else {
        return [];
    }
}

// Function to save scores to JSON file
function saveScores($scores) {
    $file = 'scores.json';
    $json = json_encode($scores, JSON_PRETTY_PRINT);
    file_put_contents($file, $json);
}

// Handle get_scores endpoint
if ($_SERVER["REQUEST_URI"] === "/get_scores") {
    $scores = loadScores();
    header('Content-Type: application/json');
    echo json_encode($scores);
    exit();
}

// Handle write_score endpoint
if (strpos($_SERVER["REQUEST_URI"], "/write_score") === 0) {
    $url_parts = explode("_", substr($_SERVER["REQUEST_URI"], 13)); // Extract parameters from URL
    if (count($url_parts) === 3) {
        $username = $url_parts[0];
        $gameName = $url_parts[1];
        $score = intval($url_parts[2]);

        // Load existing scores
        $scores = loadScores();

        // Update scores with new data
        if (!isset($scores[$username])) {
            $scores[$username] = [];
        }
        $scores[$username][$gameName] = $score;

        // Save scores
        saveScores($scores);

        echo "Scores saved successfully!";
        exit();
    }
}

// If no matching endpoint found, return 404
http_response_code(404);
echo "Not Found";