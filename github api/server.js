const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve HTML, CSS and JavaScript from public folder
app.use(express.static(path.join(__dirname, "public")));

// GET endpoint: /user/:username
app.get("/user/:username", async (req, res) => {
    try {
        const username = req.params.username.trim();

        if (!username) {
            return res.status(400).json({
                error: "Please provide a GitHub username."
            });
        }

        console.log(`Fetching GitHub profile: ${username}`);

        // Call GitHub API with an 8-second timeout
        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`,
            {
                signal: AbortSignal.timeout(8000)
            }
        );

        // Handle invalid username
        if (response.status === 404) {
            return res.status(404).json({
                error: "GitHub user not found. Please check the username."
            });
        }

        // Handle GitHub rate limits
        if (response.status === 403 || response.status === 429) {
            return res.status(429).json({
                error: "GitHub API rate limit reached. Please try again later."
            });
        }

        // Handle other unsuccessful responses
        if (!response.ok) {
            return res.status(502).json({
                error: "GitHub API is currently unavailable."
            });
        }

        // Convert response to JSON
        const data = await response.json();

        // Return selected fields only
        const user = {
            username: data.login,
            name: data.name,
            bio: data.bio,
            avatar: data.avatar_url,
            publicRepos: data.public_repos,
            followers: data.followers,
            following: data.following,
            profileUrl: data.html_url
        };

        console.log(`Successfully fetched: ${username}`);

        res.json(user);

    } catch (error) {
        console.error("API error:", error);

        // Handle timeout
        if (
            error.name === "TimeoutError" ||
            error.name === "AbortError"
        ) {
            return res.status(504).json({
                error: "GitHub API took too long. Please try again."
            });
        }

        // Handle network and other errors
        return res.status(500).json({
            error: "Unable to connect to GitHub. Check your internet connection."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});