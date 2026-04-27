export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');

  const { messages, system, fileData } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // On prépare le contenu : texte + éventuel fichier
  let currentContent = { role: "user", parts: [] };
  
  if (fileData) {
    currentContent.parts.push({
      inline_data: { mime_type: fileData.mime_type, data: fileData.data }
    });
  }
  
  // On ajoute le dernier message texte
  const lastUserMsg = messages[messages.length - 1].parts[0].text;
  currentContent.parts.push({ text: lastUserMsg });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: "INSTRUCTIONS : " + system }] },
          { role: "model", parts: [{ text: "Obevoir prêt." }] },
          ...messages.slice(0, -1),
          currentContent
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ reply: "Erreur : " + data.error.message });

    res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ reply: "Erreur technique." });
  }
}
