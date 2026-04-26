export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages, system } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAQZSG4N2uSXY9KHY14FQKiVmbMV1diJtc";

  try {
    // Changement vers la version V1 (Stable)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Utilisation de la structure compatible V1
        contents: [
          {
            role: "user",
            parts: [{ text: system }] // On passe les instructions système en premier message pour la compatibilité
          },
          ...messages
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur détaillée:", data.error);
      return res.status(400).json({ reply: "Erreur Google : " + data.error.message });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ reply: "L'IA n'a pas renvoyé de contenu. Vérifie tes quotas." });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Erreur Serveur:", error);
    res.status(500).json({ reply: "Erreur technique : " + error.message });
  }
}
