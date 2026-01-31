// src/services/aiPredictor.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the correct variable based on your setup (Vite vs CRA)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

export const getSmartPrediction = async (recentHistory, currentQueueLength) => {
  const historyString = recentHistory.map(h => `${h.duration}m`).join(", ");

  const prompt = `
    Context: You are a queue management expert. 
    Data: The last few customers took [${historyString}] to serve.
    Current Queue: There are ${currentQueueLength} people waiting.
    Task: Predict total wait time for the last person. 
    Constraint: Respond with ONLY a JSON object: {"predictedMinutes": number, "confidence": percentage}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("AI Error:", error);
    return { predictedMinutes: currentQueueLength * 5, confidence: 0 };
  }
};