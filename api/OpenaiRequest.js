import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        const { transcription } = req.body;
        if (!transcription) {
            return res.status(400).json({ error: 'No transcription provided' });
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-davinci-003', // or the model you are using
                prompt: `The user said: "${transcription}". Determine if they feel calm or not. Answer with "calm" or "not calm".`,
                max_tokens: 10,
            }),
        });

        if (!openaiResponse.ok) {
            const errorDetails = await openaiResponse.text();
            return res.status(openaiResponse.status).json({ error: `OpenAI request failed: ${errorDetails}` });
        }

        const data = await openaiResponse.json();
        const responseText = data.choices[0]?.text.trim();
        res.status(200).json({ text: responseText });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
