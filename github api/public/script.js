const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("username");
const statusMessage = document.getElementById("status");
const profile = document.getElementById("profile");
const searchButton = searchForm.querySelector("button");

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        statusMessage.textContent = "Please enter a GitHub username.";
        profile.classList.add("hidden");
        return;
    }

    // Show loading state
    statusMessage.textContent = "Loading...";
    profile.classList.add("hidden");
    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        // GitHub returns 404 for an unknown username
        if (response.status === 404) {
            throw new Error(
                "User not found. Please check the username and try again."
            );
        }

        if (!response.ok) {
            throw new Error(
                "Unable to fetch profile. Please try again later."
            );
        }

        const data = await response.json();

        // Display selected fields instead of raw JSON
        document.getElementById("avatar").src = data.avatar_url;
        document.getElementById("avatar").alt =
            `${data.login}'s profile picture`;

        document.getElementById("name").textContent =
            data.name || data.login;

        document.getElementById("bio").textContent =
            data.bio || "No bio available.";

        document.getElementById("repos").textContent =
            data.public_repos;

        document.getElementById("followers").textContent =
            data.followers;

        document.getElementById("following").textContent =
            data.following;

        const profileLink = document.getElementById("profileLink");
        profileLink.href = data.html_url;

        profile.classList.remove("hidden");
        statusMessage.textContent = "Profile loaded successfully!";

    } catch (error) {
        statusMessage.textContent =
            error instanceof TypeError
                ? "Network error. Please check your internet connection."
                : error.message;

        profile.classList.add("hidden");

    } finally {
        // Restore button whether success or failure
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
});