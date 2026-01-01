
import { GoogleGenAI, Type } from "@google/genai";
import { Joke, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchRandomJoke = async (language: Language, lastCategory?: string): Promise<Joke> => {
  const isChinese = language === Language.CHINESE;
  const langName = isChinese ? "Traditional Chinese" : "English";
  
  const excludeDirective = lastCategory 
    ? `IMPORTANT: The previous category was "${lastCategory}". You MUST choose a DIFFERENT theme now.` 
    : "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a funny Malaysian riddle or question-based joke in ${langName}. ${excludeDirective}`,
      config: {
        systemInstruction: `You are a legendary Malaysian comedian. Give the user a funny Malaysian-themed "Question and Answer" joke (Teka-teki).
Format as JSON with setup, punchline, and category. 
Themes: Mamak, Food, Kiasu, Asian parents, local slang.
Language: Manglish (EN) or Malaysian-Mandarin (ZH).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            setup: { type: Type.STRING },
            punchline: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["setup", "punchline", "category"]
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("No response received from AI");
    return JSON.parse(jsonStr) as Joke;
  } catch (error) {
    console.error("Error fetching joke:", error);
    throw error;
  }
};
