import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "Wear OS 5 / Android 15 Watch Face Studio",
      service: "Wearable Data Layer & WFF Engine",
      timestamp: new Date().toISOString(),
    });
  });

  // AI Watch Face Generator endpoint
  app.post("/api/gemini/generate-watchface", async (req, res) => {
    try {
      const { prompt, style = "material-you", language = "ar" } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!apiKey) {
        return res.json({
          success: true,
          isFallback: true,
          watchFace: generateFallbackWatchface(prompt, style, language),
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are an expert Google Pixel Watch UI/UX designer and Watch Face Format (WFF) architect for Wear OS 4 and Wear OS 5.
Generate a cohesive, aesthetic Google Pixel Watch face design configuration adhering to Material You / Material 3 Expressive principles.

Ensure hex colors are high contrast, harmonious Google Material 3 tones with vibrant accents against deep dark or rich OLED dials.

Output must match the requested JSON schema:
- id: unique string slug
- name: watchface title (in ${language === "ar" ? "Arabic" : "English"})
- description: poetic short description (1-2 sentences)
- type: 'analog' | 'digital' | 'hybrid'
- category: 'material-you' | 'minimal' | 'fitness' | 'artistic' | 'astronomy' | 'chronograph'
- colors: {
    primary: hex color (e.g. #76D1FF or #E0E576),
    secondary: hex color,
    tertiary: hex color,
    background: hex color (deep OLED dark, e.g. #0B0E14, #121417),
    dialBg: hex color,
    hands: hex color,
    accent: hex color,
    complicationGlow: hex color
  }
- dial: {
    style: 'ticks' | 'dots' | 'numerals' | 'minimal-quad' | 'concentric' | 'rings' | 'clean',
    ticksCount: 12 | 60 | 4 | 0,
    showHourMarks: boolean,
    showSubDial: boolean,
    hourMarkerFont: 'google-sans' | 'product-sans' | 'serif' | 'mono' | 'pixel'
  }
- hands: {
    style: 'pill' | 'needle' | 'minimal-bar' | 'arrow' | 'wireframe',
    showSeconds: boolean,
    sweepSeconds: boolean,
    tailStyle: 'circle' | 'line' | 'none'
  }
- digital: {
    font: 'google-sans' | 'product-sans' | 'serif' | 'mono' | 'pixel',
    format24h: boolean,
    showSeconds: boolean,
    layout: 'stacked' | 'horizontal' | 'large-dial' | 'compact'
  }
- complications: array of 2 to 4 slots with { slot: 'top'|'bottom'|'left'|'right'|'center', type: 'battery'|'heart_rate'|'steps'|'weather'|'calendar'|'uv'|'sunset'|'compass'|'media' }
- ambientDimLevel: number 0.2 to 0.7
- inspirationTag: brief tag like 'Material Expressive' or 'Nebula Pulse'`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Create a Google Pixel Watch face based on this idea: "${prompt}". Style preference: ${style}. Respond in ${language === "ar" ? "Arabic" : "English"}.`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
              category: { type: Type.STRING },
              colors: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  tertiary: { type: Type.STRING },
                  background: { type: Type.STRING },
                  dialBg: { type: Type.STRING },
                  hands: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  complicationGlow: { type: Type.STRING },
                },
                required: ["primary", "secondary", "background", "hands", "accent"],
              },
              dial: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  ticksCount: { type: Type.INTEGER },
                  showHourMarks: { type: Type.BOOLEAN },
                  showSubDial: { type: Type.BOOLEAN },
                  hourMarkerFont: { type: Type.STRING },
                },
                required: ["style", "showHourMarks"],
              },
              hands: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  showSeconds: { type: Type.BOOLEAN },
                  sweepSeconds: { type: Type.BOOLEAN },
                  tailStyle: { type: Type.STRING },
                },
              },
              digital: {
                type: Type.OBJECT,
                properties: {
                  font: { type: Type.STRING },
                  format24h: { type: Type.BOOLEAN },
                  showSeconds: { type: Type.BOOLEAN },
                  layout: { type: Type.STRING },
                },
              },
              complications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slot: { type: Type.STRING },
                    type: { type: Type.STRING },
                  },
                  required: ["slot", "type"],
                },
              },
              ambientDimLevel: { type: Type.NUMBER },
              inspirationTag: { type: Type.STRING },
            },
            required: ["name", "description", "type", "category", "colors", "dial", "complications"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        isFallback: false,
        watchFace: parsed,
      });
    } catch (err: any) {
      console.error("Gemini Watchface generation error:", err);
      return res.json({
        success: true,
        isFallback: true,
        watchFace: generateFallbackWatchface(
          req.body.prompt || "Default Creative",
          req.body.style || "material-you",
          req.body.language || "ar"
        ),
      });
    }
  });

  // Serve Vite in development, static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pixel Watch Studio server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackWatchface(prompt: string, style: string, lang: string) {
  const isAr = lang === "ar";
  const palettes = [
    {
      primary: "#C3E88D",
      secondary: "#80CBC4",
      tertiary: "#FFCB6B",
      background: "#0F141C",
      dialBg: "#171F2C",
      hands: "#E2F1AF",
      accent: "#FF5370",
      complicationGlow: "#C3E88D33",
    },
    {
      primary: "#A8C7FA",
      secondary: "#7C9CBF",
      tertiary: "#F28B82",
      background: "#0B0E14",
      dialBg: "#131924",
      hands: "#D3E3FD",
      accent: "#D93025",
      complicationGlow: "#A8C7FA33",
    },
    {
      primary: "#E8DEF8",
      secondary: "#D0BCFF",
      tertiary: "#CCC2DC",
      background: "#141218",
      dialBg: "#1D192B",
      hands: "#E8DEF8",
      accent: "#381E72",
      complicationGlow: "#D0BCFF33",
    },
    {
      primary: "#F8B595",
      secondary: "#F67280",
      tertiary: "#C06C84",
      background: "#0D0A14",
      dialBg: "#1A1528",
      hands: "#FFE4D6",
      accent: "#6C5B7B",
      complicationGlow: "#F6728033",
    },
  ];

  const selectedPalette = palettes[Math.floor(Math.random() * palettes.length)];

  return {
    id: `ai-face-${Date.now()}`,
    name: isAr ? `وجه بكسل: ${prompt.slice(0, 20)}` : `Pixel Face: ${prompt.slice(0, 20)}`,
    description: isAr
      ? `تصميم مستوحى من الذكاء الاصطناعي مع ألوان ماتيريال يو الديناميكية وتنسيق WFF عالي الكفاءة.`
      : `AI-crafted design featuring dynamic Material You tonal accents and energy-efficient Watch Face Format.`,
    type: "hybrid",
    category: style === "fitness" ? "fitness" : style === "minimal" ? "minimal" : "material-you",
    colors: selectedPalette,
    dial: {
      style: "concentric",
      ticksCount: 12,
      showHourMarks: true,
      showSubDial: true,
      hourMarkerFont: "google-sans",
    },
    hands: {
      style: "pill",
      showSeconds: true,
      sweepSeconds: true,
      tailStyle: "circle",
    },
    digital: {
      font: "google-sans",
      format24h: true,
      showSeconds: false,
      layout: "stacked",
    },
    complications: [
      { slot: "top", type: "battery" },
      { slot: "bottom", type: "steps" },
      { slot: "left", type: "heart_rate" },
      { slot: "right", type: "weather" },
    ],
    ambientDimLevel: 0.35,
    inspirationTag: "Material 3 AI Studio",
  };
}

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
});
