export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { format = 'Case Study', notes = '' } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const systemPrompt =
      `You are Symposia. Turn clinical notes into a structured draft for the chosen format.
       Use a professional medical tone and end with "Recommended Additions" if key info is missing.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Target format: ${format}\n\nNotes:\n${notes}` },
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const draft = data.choices?.[0]?.message?.content || "No draft generated.";
    res.status(200).json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
