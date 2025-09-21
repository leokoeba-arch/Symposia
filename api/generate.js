export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { format = 'Case Study', notes = '', images = [] } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    // Add footnotes for images
    const imageNotes = images.map((name, idx) => `Figure ${idx + 1}: ${name}`).join('\n');

    const systemPrompt =
      "You are Symposia. Turn clinical notes into a structured draft for the chosen format. " +
      "If images are provided, add footnotes referencing them (Figure 1, Figure 2...). " +
      "Use a professional medical tone. If information is missing, add a section 'Recommended Additions'.";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        max_completion_tokens: 800,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Target format: ${format}\n\nNotes:\n${notes}\n\n${imageNotes}` },
        ],
      }),
    });

    const data = await resp.json();

    if (!data.choices || !data.choices[0].message?.content) {
      return res.status(500).json({ error: "No draft generated", details: data });
    }

    res.status(200).json({ draft: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
