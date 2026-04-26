export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages, system } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Endpoint corrigé pour éviter l'erreur "not found"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: "SYSTEM_INSTRUCTION: " + system }] },
          { role: "model", parts: [{ text: "Compris, je suis Obevoir." }] },
          ...messages
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ reply: "Erreur Google : " + data.error.message });

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Erreur technique : " + error.message });
  }
}
