export default async function handler(req, res) {
    console.log("Google API key request received.");

    // Add CORS headers to allow cross-origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight request for CORS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Check for the Google API key in environment variables
    if (process.env.GOOGLE_API_KEY) {
        console.log("Google API key found and sent."); // No longer exposing the actual key in logs
        res.status(200).json({ googleApiKey: process.env.GOOGLE_API_KEY });
    } else {
        console.error("Google API key not found in environment variables.");
        res.status(500).json({ error: "Google API key not found" });
    }
}
