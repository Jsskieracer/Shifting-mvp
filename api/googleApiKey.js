export default async function handler(req, res) {
    if (process.env.GOOGLE_API_KEY) {
        console.log("Google API key found and returned.");
        res.status(200).json({ googleApiKey: process.env.GOOGLE_API_KEY });
    } else {
        console.error("Google API key not found in environment variables.");
        res.status(500).json({ error: "Google API key not found" });
    }
}
