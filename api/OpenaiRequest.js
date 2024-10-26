import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        // Ensure that the request method is POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // console.error("OpenAI transcription:", req.body);

        // Parse the body to get the transcription
        // const { transcription } = req.body || {};

        // if (!transcription) {
        //     console.error("No transcription provided in the request body:", req.body);
        //     return res.status(400).json({ error: 'No transcription provided' });
        // }

        const transcription = req.body.transcription;

        console.log("Received transcription:", transcription);

        // Send the request to OpenAI with an updated model
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Analyze the following transcription and determine if the user feels calm: "${transcription}". Answer only with "calm" or "not calm".`
                    }
                ],
                max_tokens: 10,
                temperature: 0.0,
            }),
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI request failed:", errorText);
            return res.status(openaiResponse.status).json({ error: `OpenAI request failed: ${errorText}` });
        }

        const data = await openaiResponse.json();
        const gptResponse = data.choices[0]?.message?.content?.trim();

        console.log("OpenAI response text:", gptResponse);
        res.status(200).json({ text: gptResponse });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

module.exports = allowCors(handler)
