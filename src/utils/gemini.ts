import { GoogleGenAI } from "@google/genai";
import type { TItem } from '../types/TItem';

const systemPrompt = `
Your job is to recieve a prompt in the form of a json list of ingredients that may be in french or english, and may or may not have categories. You should add categories to the ingredients that do not already have them. Do not modify the name of the ingredients or any timestamps associated with them. Just add the categories. The goal of the categories is to group the ingredients by aisle so that they can easily be found when shopping. The category names must always be in french, regardless of the ingredient's language. Do not answer with markup syntax, your response must be pure json.
`;

export async function categoriseWithGemini(items: TItem[], apiKey: string) {
  if (!apiKey) {
    console.warn("Gemini API key is required.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = JSON.stringify({ items });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userPrompt,
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (err) {
    console.error("Gemini call failed:", err);
    return null;
  }
}
