import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function dataUrlToGeminiPart(dataUrl: string): { inlineData: { mimeType: string; data: string } } {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].split(':')[1].split(';')[0];
  const base64Data = parts[1];
  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

export const analyzeImageRegion = async (imageDataUrl: string): Promise<string> => {
  const imagePart = dataUrlToGeminiPart(imageDataUrl);
  const prompt = "Analyze this astronomical image as if you were a deep learning model like YOLO or one trained on ImageNet. Your task is to identify and list the primary celestial objects and distinct features. For each object, provide a label (e.g., 'Spiral Galaxy', 'Star Cluster', 'Emission Nebula') and a brief, one-sentence description. Present the output as a clear, itemized list.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          temperature: 0.4,
          topP: 0.95,
          topK: 40,
        },
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the Gemini API.');
  }
};