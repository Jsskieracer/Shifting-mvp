const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { transcription } = req.body;
    console.log("Received transcription for analysis: " + transcription);

    if (!transcription) {
        console.error("No transcription provided.");
        return res.status(400).json({ error: "No transcription provided" });
    }

    try {
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
        console.log("OpenAI API response: " + JSON.stringify(data));

        // Check if response contains the expected data
        if (data.choices && data.choices[0] && data.choices[0].text) {
            const text = data.choices[0].text.trim();
            res.status(200).json({ text });
        } else {
            console.error("Invalid OpenAI response structure.");
            res.status(500).json({ error: "Invalid OpenAI response structure" });
        }
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        res.status(500).json({ error: "Error communicating with OpenAI API" });
    }
}
