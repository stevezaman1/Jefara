import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with custom telemetry headers
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("[Jefara Warning] GEMINI_API_KEY is not defined in current environment variables.");
  }
} catch (err) {
  console.error("[Jefara Error] Could not initialize GoogleGenAI:", err);
}

// Server-Side secure API to handle custom Jefara LLM questions
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, contextInfo, history } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: "Le service d'assistance IA n'est pas encore opérationnel. Renseignez la clé GEMINI_API_KEY dans le panneau des Secrets de Google AI Studio puis redémarrez."
      });
    }

    // Build exhaustive context-rich system prompts to guide custom professional RH consulting
    const systemInstruction = `Tu es "Jefara AI", l'assistant virtuose RH, paie et conformité fiscale en Afrique, intégré à la solution Jefara.
Ton rôle est d'épauler les administrateurs pour piloter l'entreprise et d'accompagner les employés (collaborateurs) dans leurs interrogations.

Voici un cliché de la base de données en temps réel pour éclairer tes réponses de façon 100% exacte :
${contextInfo ? JSON.stringify(contextInfo, null, 2) : "Aucune base chargée."}

Lignes directrices d'élocution :
1. Sois extrêmement professionnel, pédagogue, structuré et rédigé en français impeccable.
2. Si l'on te pose des questions sur les salaires, les charges patronales/salariales, le net à payer, les congés maladie/annuels ou les provisions comptables de fin de mois d'un employé de Jefara, utilise STRICTEMENT les données fournies pour donner des valeurs exactes. Pas d'estimations approximatives.
3. Tu es capable de rédiger un draft de contrat de travail (CDI/CDD Cameroun, Côte d'Ivoire, Sénégal), une fiche d'évaluation de performance, de formuler des recommandations stratégiques ou d'analyser d'autres éléments.
4. Formate tes réponses avec de sublimes listes à puces Markdown, du gras et de belles tables si nécessaire.`;

    // Map conversational history
    const geminiHistory = (history || []).map((h: any) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.parts?.[0]?.text || h.text || "" }]
    }));

    // Generate response using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Règles de comportement : ${systemInstruction}` }] },
        { role: 'model', parts: [{ text: "Entendu. Je suis configuré comme l'assistant IA de Jefara. Je dispose des informations de l'entreprise en temps réel et formulerai des avis réglementaires précis." }] },
        ...geminiHistory,
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    const answer = response.text || "Je n'ai pas pu formuler de réponse textuelle.";
    res.json({ message: answer });
  } catch (err: any) {
    console.error("[Jefara AI Proxy Error]:", err);
    res.status(500).json({ error: err.message || "Erreur interne de traitement d'intelligence artificielle" });
  }
});

// Setup development HMR-less Vite middleware or static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Jefara Fullstack Server] App running on port ${PORT}`);
  });
}

bootstrap();
