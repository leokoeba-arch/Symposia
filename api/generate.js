export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { format, notes } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const systemPrompt = `
      You are Symposia. Turn the provided clinical notes into a structured ${format}.
      Use professional medical tone.
      End with a "Recommended Additions" section if key information seems missing.
    `;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Notes:\n${notes}` },
        ],
        max_completion_tokens: 800,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("❌ OpenAI API error:", data);
      return res
        .status(500)
        .json({ error: data.error?.message || "OpenAI request failed" });
    }

    // ✅ Correct way to read response
    const draft =
      data.choices?.[0]?.message?.content ||
      "⚠️ Draft could not be generated.";

    res.status(200).json({ draft });
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ error: "Server error generating draft" });
  }
}
