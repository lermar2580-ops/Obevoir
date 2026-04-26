export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages, system } = req.body;
  // Vercel lira automatiquement la clé sécurisée ici
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: "Instructions système : " + system }] },
          { role: "model", parts: [{ text: "Compris. Je suis Obevoir." }] },
          ...messages
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ reply: "Erreur Google : " + data.error.message });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Erreur technique : " + error.message });
  }
}
