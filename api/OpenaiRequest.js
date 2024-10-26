import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        console.log("Received request body:", req.body);
        const { transcription } = req.body;

        // Validate the input
        if (!transcription) {
            console.error("No transcription provided");
            return res.status(400).json({ error: 'No transcription provided' });
        }

        console.log("Sending request to OpenAI with transcription:", transcription);

        // Send the request to OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: `Analyze the following transcription and determine if the user feels calm: "${transcription}". Answer only with "calm" or "not calm".`,
                max_tokens: 10,
                temperature: 0.5,
            }),
        });

        console.log("Received response from OpenAI:", openaiResponse);

        // Handle OpenAI response
        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI request failed:", errorText);
            return res.status(openaiResponse.status).json({ error: `OpenAI request failed: ${errorText}` });
        }

        const data = await openaiResponse.json();
        const gptResponse = data.choices[0]?.text?.trim();

        console.log("OpenAI response text:", gptResponse);
        res.status(200).json({ text: gptResponse });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
