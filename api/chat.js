export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages, system } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAQZSG4N2uSXY9KHY14FQKiVmbMV1diJtc";

  // Construction de l'URL avec le modèle spécifique "latest"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Instructions système : " + system }]
          },
          {
            role: "model",
            parts: [{ text: "Compris. Je suis Obevoir." }]
          },
          ...messages
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    // Si Google renvoie une erreur
    if (data.error) {
      return res.status(data.error.code || 400).json({ 
        reply: `Erreur Google (${data.error.status}) : ${data.error.message}` 
      });
    }

    // Vérification de la présence de candidats
    if (data.candidates && data.candidates[0].content) {
      const botReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botReply });
    } 
    
    return res.status(500).json({ reply: "L'IA n'a pas pu générer de texte (Filtre de sécurité ou erreur interne)." });

  } catch (error) {
    return res.status(500).json({ reply: "Erreur de connexion au serveur Vercel : " + error.message });
  }
}
