import { GoogleGenAI, Type } from "@google/genai";
import { AssetParams, ShapeType } from "../types";

// Helper to sanitize JSON string if it contains markdown code blocks
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

export const parseAssetPrompt = async (prompt: string): Promise<Partial<AssetParams>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
  You are a 3D procedural engine configuration assistant. 
  Your job is to translate a user's creative text description into specific 3D parameters for a Three.js scene.
  Analyze the prompt and determine the most appropriate geometric primitive and material properties.
  
  Supported Shapes: box, sphere, cylinder, torus, cone, capsule, dodecahedron.
  Default to 'box' if unsure.
  Scale should be a vector [x, y, z], typically around [1, 1, 1].
  Roughness and Metalness are 0.0 to 1.0.
  Color should be a hex string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this request: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shape: { type: Type.STRING, enum: ['box', 'sphere', 'cylinder', 'torus', 'cone', 'capsule', 'dodecahedron'] },
            color: { type: Type.STRING, description: "Hex color code, e.g. #ff0000" },
            roughness: { type: Type.NUMBER },
            metalness: { type: Type.NUMBER },
            scale: { 
              type: Type.ARRAY, 
              items: { type: Type.NUMBER },
              description: "Array of 3 numbers for X, Y, Z scale" 
            },
            name: { type: Type.STRING, description: "A short display name for the asset" },
          },
          required: ["shape", "color", "roughness", "metalness", "scale", "name"]
        }
      }
    });

    if (response.text) {
        const data = JSON.parse(cleanJsonString(response.text));
        return {
            ...data,
            scale: data.scale && data.scale.length === 3 ? data.scale : [1,1,1]
        };
    }
    throw new Error("No JSON returned");

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    // Fallback
    return {
      shape: 'sphere',
      color: '#cccccc',
      roughness: 0.5,
      metalness: 0.5,
      scale: [1, 1, 1],
      name: 'Unknown Object'
    };
  }
};

export const generateTexture = async (prompt: string): Promise<string | undefined> => {
   const apiKey = process.env.API_KEY;
   if (!apiKey) return undefined;

   const ai = new GoogleGenAI({ apiKey });

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Using the nano banana model for image gen
        contents: {
            parts: [
                { text: `Create a seamless texture map for: ${prompt}. Top down view, flat lighting, high resolution texture.` }
            ]
        },
        config: {
            // responseMimeType is not supported for this model, it returns parts
        }
     });
     
     // Extract image from parts
     const parts = response.candidates?.[0]?.content?.parts;
     if (parts) {
         for (const part of parts) {
             if (part.inlineData && part.inlineData.data) {
                 return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
             }
         }
     }
     return undefined;
   } catch (error) {
       console.error("Texture Gen Error:", error);
       return undefined;
   }
}
