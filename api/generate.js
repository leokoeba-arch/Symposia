export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { format = 'Case Study', notes = '', images = [] } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    // If images provided, get concise findings first
    let imageFindings = '';
    if (Array.isArray(images) && images.length > 0) {
      const visionResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a medical assistant describing clinical images succinctly.' },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Provide brief, neutral captions and key clinical findings for these images.' },
                ...images.map(img => ({ type: 'input_image', image_url: { url: img.dataUrl } }))
              ]
            }
          ]
        })
      });
      const visionData = await visionResp.json();
      imageFindings = visionData?.choices?.[0]?.message?.content || '';
    }

    const systemPrompt =
      'You are Symposia, an assistant that turns clinical content into structured drafts (Abstract, Case Study, Presentation). ' +
      'Use professional medical tone and standard sections for the chosen format. ' +
      'If key info is missing, add a final section: "Recommended Additions".';

    const combinedText =
      `Target Format: ${format}\n\n` +
      `User Notes:\n${notes || '(none)'}\n\n` +
      (imageFindings ? `Image Findings:\n${imageFindings}\n\n` : '');

    const draftResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: [{ type: 'text', text: combinedText }] },
          { role: 'user', content: [{ type: 'text', text: 'Create the first structured draft now.' }] }
        ]
      })
    });

    const data = await draftResp.json();
    if (!draftResp.ok) return res.status(500).json({ error: 'AI generation failed', details: data });

    const draft = data.choices?.[0]?.message?.content || 'No draft generated.';
    res.status(200).json({ draft });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}
