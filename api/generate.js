export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      format = 'Case Report',
      notes = '',
      image_captions = []
    } = req.body || {};

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    let userPrompt = `Target format: ${format}\n\nClinical Notes:\n${notes.trim()}`;

    if (Array.isArray(image_captions) && image_captions.length > 0) {
      const captionBlock = image_captions
        .map((c, i) => `Figure ${i + 1}: ${c}`)
        .join('\n');
      userPrompt += `\n\nImage Captions:\n${captionBlock}`;
    }

    const systemPrompt =
      'You are Symposia, an AI assistant helping clinicians structure drafts from notes. ' +
      'Write a professional medical document in the requested format. ' +
      'If image captions are provided, insert references to them (e.g. "Figure 1 shows...", "See Image 2"). ' +
      'End with a section called "Recommended Additions" if important data appears to be missing.';

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('OpenAI error:', data);

      if (data?.error?.code === 'model_not_found' || data?.error?.message?.match(/model/i)) {
        const fallback = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
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
