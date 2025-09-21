export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format, notes, images } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    // Build the system prompt
    const systemPrompt = `
      You are Symposia. Turn the provided clinical notes into a structured ${format}.
      Use a professional medical tone. If images are provided, suggest how they might be 
      referenced in the text (e.g., "as shown in Figure 1"). 
      End with a "Recommended Additions" section if key information seems missing.
    `;

    // Call OpenAI
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",   // smaller, cheaper model for draft
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Notes:\n${notes}` },
        ],
        max_completion_tokens: 1000, // enough for multi-section drafts
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI request failed" });
    }

    const draft = data.choices?.[0]?.message?.content || "⚠️ Draft could not be generated.";

    // Always return both text and images
    res.status(200).json({
      draft,
      images: images || []
    });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Server error generating draft" });
  }
}
