export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { term, category } = req.body;
  if (!term) return res.status(400).json({ error: "Terme manquant" });

  const CATEGORIES = {
    all: null, science: "Sciences", histoire: "Histoire",
    philosophie: "Philosophie", linguistique: "Linguistique",
    arts: "Arts & Lettres", economie: "Économie", geographie: "Géographie",
  };
  const catHint = category && CATEGORIES[category]
    ? ` Domaine prioritaire : ${CATEGORIES[category]}.` : "";

  const systemPrompt = `Tu es un dictionnaire encyclopédique francophone de haute qualité, rigoureux et pédagogique. 
Pour chaque mot ou concept demandé, tu fournis :
1. **Étymologie** (si pertinente) : origine et date d'apparition
2. **Définition principale** : claire, précise, en une ou deux phrases
3. **Développement encyclopédique** : explication approfondie, contexte, nuances
4. **Domaines d'application** : disciplines où ce terme est utilisé
5. **Exemples** : concrets et illustratifs
6. **Notions connexes** : 3 à 5 termes liés

Utilise **gras** pour les termes importants, *italique* pour les termes étrangers ou techniques.
Sois encyclopédique mais accessible. Langue : français.${catHint}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Définis et développe encyclopédiquement : « ${term} »` },
        ],
      }),
    });

    const data = await groqRes.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}
