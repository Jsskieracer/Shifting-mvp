const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { transcription, googleApiRequest } = req.body;

    if (googleApiRequest) {
        // Return the Google API key if requested
        res.status(200).json({ googleApiKey: process.env.GOOGLE_API_KEY });
        return;
    }

    // Proceed with the OpenAI API request if transcription is provided
    if (transcription) {
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Based on the following user response, determine if the user feels calm, has fewer thoughts, is feeling quiet or still. If any of these indicators are present, respond with "calm." Otherwise, respond with "not calm." Here is the user response:\n\n"${transcription}"`,
                max_tokens: 10,
                temperature: 0,
            }),
        });

        const data = await response.json();
        res.status(200).json(data);
    } else {
        res.status(400).json({ error: "No transcription or googleApiRequest specified" });
    }
}
