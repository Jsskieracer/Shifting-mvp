import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        const { transcription } = req.body;

        // Validate the input
        if (!transcription) {
            return res.status(400).json({ error: 'No transcription provided' });
        }

        // Send the request to OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-davinci-003', // or the model you are using
                prompt: `Analyze the following transcription and determine if the user feels calm: "${transcription}". Answer only with "calm" or "not calm".`,
                max_tokens: 10,
                temperature: 0.5,
            }),
        });

        // Handle OpenAI response
        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            return res.status(openaiResponse.status).json({ error: `OpenAI request failed: ${errorText}` });
        }

        const data = await openaiResponse.json();
        const gptResponse = data.choices[0]?.text?.trim();

        res.status(200).json({ text: gptResponse });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
