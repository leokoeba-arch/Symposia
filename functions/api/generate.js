module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { notes = "", format = "Case Report", image_captions = [] } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const systemPrompt =
      "You are Symposia, an AI assistant helping clinicians structure drafts from notes. " +
      "Write a professional medical document in the requested format. " +
      'If image captions are provided, reference them (e.g. "Figure 1 shows..."). ' +
      'End with a section called "Recommended Additions" if data seems missing.';

    const userPrompt =
      `Target format: ${format}\n\nClinical Notes:\n${notes}\n\n` +
      (image_captions.length
        ? "Images:\n" + image_captions.map((c, i) => `Figure ${i + 1}: ${c}`).join("\n")
        : "");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json({ draft: data.choices?.[0]?.message?.content || "No draft." });
  } catch (err) {
    console.error("Error generating draft:", err);
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
};
