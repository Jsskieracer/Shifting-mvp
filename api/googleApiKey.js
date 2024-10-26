async function fetchGoogleApiKey() {
    try {
        const response = await fetch("https://shifting-mvp.vercel.app/api/googleApiKey", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.googleApiKey) {
            return data.googleApiKey;
        } else {
            throw new Error("Google API key not found in response.");
        }
    } catch (error) {
        logMessage("Error fetching Google API key: " + error.message);
        return null;
    }
}
