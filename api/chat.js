export default async function handler(req, res) {
  // Sécurité : n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages, system } = req.body;
  
  // Utilise la variable d'environnement Vercel ou ta clé en dur par défaut
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAQZSG4N2uSXY9KHY14FQKiVmbMV1diJtc";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Configuration des instructions système (Profil d'Obed)
        system_instruction: {
          parts: [{ text: system }]
        },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur API Google:", data.error);
      return res.status(data.error.code || 400).json({ error: data.error.message });
    }

    // Extraction propre de la réponse texte
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    
    // On renvoie un JSON simplifié à l'interface
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Erreur Serveur Vercel:", error);
    res.status(500).json({ error: "Erreur de communication avec l'IA." });
  }
}
