export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { format = 'Case Study', notes = '' } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    const systemPrompt =
      'You are Symposia. Turn clinical notes into a structured draft for the chosen format. ' +
      'Use professional medical tone and end with "Recommended Additions" if key info is missing.';

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini', // if this fails, we’ll try another model below
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Target format: ${format}\n\nNotes:\n${notes}` },
        ],
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      // Log for Vercel Functions tab and return to client so you see it
      console.error('OpenAI error:', data);
      // If model not found/unauthorized, try a fallback model once:
      if (data?.error?.code === 'model_not_found' || data?.error?.message?.match(/model/i)) {
        const fallback = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o', // fallback
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Target format: ${format}\n\nNotes:\n${notes}` },
            ],
          }),
        });
        const fbData = await fallback.json();
        if (!fallback.ok) {
          console.error('Fallback error:', fbData);
          return res.status(500).json({ error: 'AI generation failed', details: fbData });
        }
        return res.status(200).json({ draft: fbData.choices?.[0]?.message?.content || 'No draft.' });
      }
      return res.status(500).json({ error: 'AI generation failed', details: data });
    }

    return res.status(200).json({ draft: data.choices?.[0]?.message?.content || 'No draft.' });
  } catch (e) {
    console.error('Server error:', e);
    return res.status(500).json({ error: 'Server error', details: String(e) });
  }
}
