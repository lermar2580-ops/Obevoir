export default async function handler(req, res) {
  const apiKey = "AIzaSyAQZSG4N2uSXY9KHY14FQKiVmbMV1diJtc"; // Teste avec une clé neuve ici

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.messages[req.body.messages.length - 1].parts[0].text }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ reply: "Erreur Google : " + data.error.message });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: text });

  } catch (error) {
    res.status(500).json({ reply: "Erreur Proxy : " + error.message });
  }
}
