import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import type { TItem } from '../types/TItem';

/**
 * Returns system prompt for categorisation, with user's chosen language inserted
 * @param langCategories
 * @returns System prompt customised with language
 */
function getSystemPrompt(langCategories: string) {
  return `
You are a data transformation assistant.

Your task is to receive a JSON list of items. Items may be written in any language and may already contain a category field.

Your job is to add a category field to every item that does not already have one. You may update an existing category if it is not in the list of allowed categories below, or the item clearly belongs in a different allowed category.

When multiple categories could apply, choose the category corresponding to where the item is most commonly found in a supermarket.

### CRITICAL LANGUAGE RULE:
- All category values in the output JSON must be written in the language specified by the user: "${langCategories}".
- You MUST translate the allowed category names listed below into "${langCategories}".
- Do NOT output the categories in English, the language of the original item, or any other language, UNLESS that language is exactly "${langCategories}".
- Always keep the exact emojis attached to the categories, regardless of the target translation language.
- Before outputting, double-check that every category string matches "${langCategories}" translation and contains the correct emoji.

Rules:
- Do not modify item names.
- Do not modify, remove, reorder, or alter any timestamps or other existing fields. Preserve all existing fields exactly. The only permitted modification is setting category when it is null or missing.
- Only add missing categories.
- Categories should represent grocery store aisles or shopping sections, allowing items to be easily grouped while shopping.
- Use practical aisle-level categories, not overly broad categories.
- If an item does not clearly fit a category, choose the closest reasonable grocery category, or use the translation of "📦 Other" in "${langCategories}".

Output requirements:
- Return only valid JSON.
- Do not include markdown, explanations, comments, or additional text.
- Preserve the original JSON structure and fields, only adding missing category fields.

Allowed categories (Default English - translate these to "${langCategories}"):
- 🍎🥕 Fruits & Vegetables
- 🥩 Meat
- 🐟🦐 Fish & Seafood
- 🥛🧀 Dairy & Cheese
- 🥖 Bakery
- 🧂 Savory Pantry
- 🍫🍪 Sweet Pantry
- 🥤 Beverages
- 🧊 Frozen Foods
- 🥫 Canned Goods
- 🫙 Condiments & Sauces
- 🍝🌾 Pasta, Rice & Grains
- 🫒 Oils & Vinegars
- 🍿 Snacks
- 🧹🧴 Household Supplies
- 🧼💄 Personal Care
- 📦 Other

Example input:
[
  {
    "id": "1",
    "name": "pomme",
    "category": null,
    "updatedAt": "2026-07-08T10:30:00.000Z",
    "syncedAt": null,
    "isDeleted": false
  },
  {
    "id": "2",
    "name": "milk",
    "category": "🥛🧀 Dairy & Cheese",
    "updatedAt": "2026-07-08T10:31:00.000Z",
    "syncedAt": "2026-07-08T10:32:00.000Z",
    "isDeleted": false
  },
  {
    "id": "3",
    "name": "pechuga de pollo",
    "category": null,
    "updatedAt": "2026-07-08T10:33:00.000Z",
    "syncedAt": null,
    "isDeleted": false
  }
]

Example output (Assuming the laguage choses by the user for the categories is English):
[
  {
    "id": "1",
    "name": "pomme",
    "category": "🍎🥕 Fruits & Vegetables",
    "updatedAt": "2026-07-08T10:30:00.000Z",
    "syncedAt": null,
    "isDeleted": false
  },
  {
    "id": "2",
    "name": "milk",
    "category": "🥛🧀 Dairy & Cheese",
    "updatedAt": "2026-07-08T10:31:00.000Z",
    "syncedAt": "2026-07-08T10:32:00.000Z",
    "isDeleted": false
  },
  {
    "id": "3",
    "name": "pechuga de pollo",
    "category": "🥩 Meat",
    "updatedAt": "2026-07-08T10:33:00.000Z",
    "syncedAt": null,
    "isDeleted": false
  }
]
`;
}

/**
 * Detects the active provider and proceeds to make requests to the provider.
 * @param providerName
 * @param items
 * @param apiKey
 * @param langCategories
 * @returns Full JSON list with categories
 */
export async function categoriseWithAI(providerName: string, items: TItem[], apiKey: string, langCategories: string) {
  const systemPrompt = getSystemPrompt(langCategories);
  try {

    switch (providerName) {
      case "Gemini":
        return await categoriseWithGemini(items, apiKey, systemPrompt);

      case "Groq":
        return await categoriseWithGroq(items, apiKey, systemPrompt);
    }
  } catch (error) {
    console.error("Error categorising with AI", error)
    throw error
  }
}


/**
 * Makes request to gemini API to categorise the items, according to user language
 * @param items
 * @param apiKey
 * @param langCategories
 * @returns Full JSON list with categories, or null if failed
 */
async function categoriseWithGemini(items: TItem[], apiKey: string, systemPrompt: string) {
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

/**
 * Makes request to groq API to categorise the items, according to user language
 * @param items
 * @param apiKey
 * @param langCategories
 * @returns Full JSON list with categories, or null if failed
 */
async function categoriseWithGroq(items: TItem[], apiKey: string, systemPrompt: string) {
  if (!apiKey) {
    console.warn("Groq API key is required.");
    return null;
  }

  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const userPrompt = JSON.stringify({ items });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content;

    if (responseText) {
      return JSON.parse(responseText);
    }
    return null;
  } catch (err) {
    console.error("Groq call failed:", err);
    return null;
  }
}
