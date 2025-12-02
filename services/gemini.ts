import { GoogleGenAI, Type } from "@google/genai";
import { ConceptData, ConceptGraphData, QuizQuestion } from '../types';

// Ensure API Key is present
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

export const fetchConceptOverview = async (topic: string): Promise<ConceptData> => {
  const prompt = `
    Analyze the concept "${topic}". 
    Provide a structured learning breakdown including a summary, a beginner-friendly explanation, an advanced technical explanation, key takeaways, and a real-world analogy.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          summary: { type: Type.STRING },
          beginnerExplanation: { type: Type.STRING },
          advancedExplanation: { type: Type.STRING },
          keyTakeaways: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          realWorldAnalogy: { type: Type.STRING }
        },
        required: ["topic", "summary", "beginnerExplanation", "advancedExplanation", "keyTakeaways", "realWorldAnalogy"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as ConceptData;
};

export const fetchConceptMap = async (topic: string): Promise<ConceptGraphData> => {
  const prompt = `
    Create a knowledge graph for the concept "${topic}".
    Identify 8-15 related sub-concepts or terms (nodes) and how they connect (links).
    Group 1 is the main topic, Group 2 are direct sub-concepts, Group 3 are related terms.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                group: { type: Type.INTEGER },
                description: { type: Type.STRING }
              },
              required: ["id", "group", "description"]
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                value: { type: Type.INTEGER }
              },
              required: ["source", "target", "value"]
            }
          }
        },
        required: ["nodes", "links"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as ConceptGraphData;
};

export const fetchQuiz = async (topic: string, difficulty: 'beginner' | 'advanced'): Promise<QuizQuestion[]> => {
  const prompt = `
    Generate 5 multiple-choice questions to test knowledge on "${topic}" at a ${difficulty} level.
    Include the correct answer index (0-3) and a brief explanation for why it is correct.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as QuizQuestion[];
};