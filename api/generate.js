import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from "docx";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } }, // allow larger file uploads
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { format = "Case Study", notes = "", images = [] } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    // Add footnote refs for AI
    const imageRefs = images.map((name, idx) => `Figure ${idx + 1}: ${name}`).join("\n");

    const systemPrompt =
      "You are Symposia. Write a structured medical draft based on user notes. " +
      "If images are provided, add numbered captions (Figure 1, 2, etc.) where relevant.";

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
          { role: "user", content: `Format: ${format}\n\nNotes:\n${notes}\n\n${imageRefs}` },
        ],
      }),
    });

    const data = await resp.json();
    if (!data.choices || !data.choices[0].message?.content) {
      return res.status(500).json({ error: "No draft generated", details: data });
    }

    const draft = data.choices[0].message.content;

    // Build Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Symposia Draft",
              heading: HeadingLevel.TITLE,
              alignment: "center",
            }),
            ...draft.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun(line)],
                  spacing: { after: 200 },
                })
            ),
            ...images.map(
              (img, idx) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `Figure ${idx + 1}: ${img}`, bold: true }),
                  ],
                  alignment: "center",
                  spacing: { before: 400, after: 200 },
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Save temporary file (works on Vercel ephemeral storage for response only)
    const filename = `draft_${Date.now()}.docx`;
    const filepath = path.join("/tmp", filename);
    fs.writeFileSync(filepath, buffer);

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
