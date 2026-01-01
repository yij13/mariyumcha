
import { GoogleGenAI, Type, Modality } from "@google/genai";
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

export const speakText = async (text: string): Promise<Uint8Array> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this naturally like a Malaysian friend: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");
    
    // Manual base64 decode to bytes
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};
