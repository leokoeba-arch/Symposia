export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format = 'Case Study', notes = '', images = [] } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    const systemPrompt =
      "You are Symposia. Turn clinical notes into a structured draft for the chosen format. " +
      "Use professional medical tone and end with 'Recommended Additions' if key info is missing.";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",   // efficient for drafts
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Target format: ${format}\n\nNotes:\n${notes}` },
        ],
        max_completion_tokens: 800, // updated param (not max_tokens)
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: err });
    }

    const data = await resp.json();
    const draft = data.choices?.[0]?.message?.content || "⚠️ No draft generated.";

    // Return draft + the uploaded image URLs
    res.status(200).json({
      draft,
      images, // These are URLs created in index.html for preview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
