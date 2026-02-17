import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
    private ai: GoogleGenAI | null = null;
    private apiKey: string | undefined;

    constructor() {
        this.apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (this.apiKey) {
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        } else {
            console.warn("GeminiService: API Key is missing. AI features will be disabled.");
        }
    }

    /**
     * Generates evaluation criteria based on a template profile.
     */
    async generateCriteria(data: { name: string, description: string, skills: string[], difficulty: string }): Promise<any[]> {
        if (!this.apiKey || !this.ai) return [];
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Generate 5 detailed evaluation criteria (interview questions) for an AI agent with the following profile:
                Name: ${data.name}
                Description: ${data.description}
                Skills: ${data.skills.join(', ')}
                Difficulty: ${data.difficulty}
                
                Return the output as a JSON object containing an array of criteria with 'prompt', 'expected', and 'minScore' fields.
                'minScore' should be an integer between 0 and 100 representing the acceptance threshold percentage (difficulty of passing this specific question).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            criteria: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        prompt: { type: Type.STRING, description: "The specific question or prompt to test the agent." },
                                        expected: { type: Type.STRING, description: "A summary of the expected correct response or behavior." },
                                        minScore: { type: Type.INTEGER, description: "The acceptance threshold percentage (0-100)." }
                                    },
                                    required: ['prompt', 'expected', 'minScore']
                                }
                            }
                        },
                        required: ['criteria']
                    }
                }
            });

            if (response.text) {
                const result = JSON.parse(response.text);
                return result.criteria || [];
            }
            return [];
        } catch (error) {
            console.error("GeminiService: Failed to generate criteria", error);
            // Don't throw, just return empty to avoid UI crash
            return [];
        }
    }

    /**
     * Simulates an agent's response to a specific question based on its persona.
     */
    async simulateAgentResponse(data: { skills: string[], description: string }, question: string): Promise<string> {
        if (!this.apiKey || !this.ai) return "AI Service Unavailable (Missing Key)";
        try {
            const agentPrompt = `
                You are an AI agent being interviewed.
                Your persona skills: ${data.skills.join(', ')}.
                Description: ${data.description}.
                
                Question: "${question}"
                
                Answer the question as this persona would. Keep it concise (under 50 words).
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: agentPrompt
            });

            return response.text || "I cannot answer that.";
        } catch (error) {
            console.error("GeminiService: Failed to simulate agent response", error);
            return "Error generating response.";
        }
    }

    /**
     * Evaluates an agent's response against expected criteria.
     */
    async evaluateResponse(question: string, expected: string, actual: string): Promise<{ score: number, reasoning: string }> {
        if (!this.apiKey || !this.ai) return { score: 0, reasoning: "AI Service Unavailable" };
        try {
            const graderPrompt = `
                You are an automated evaluator.
                
                Question: "${question}"
                Expected Criteria: "${expected}"
                Actual Answer: "${actual}"
                
                Evaluate the answer. Return a JSON object:
                {
                    "score": number (0-100),
                    "reasoning": "short explanation"
                }
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: graderPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.INTEGER },
                            reasoning: { type: Type.STRING }
                        }
                    }
                }
            });

            if (response.text) {
                return JSON.parse(response.text);
            }
            return { score: 0, reasoning: "Evaluation failed to parse." };
        } catch (error) {
            console.error("GeminiService: Failed to evaluate response", error);
            return { score: 0, reasoning: "Evaluation error." };
        }
    }

    /**
     * Re-evaluates a response without specific expected criteria (blind grading based on quality).
     */
    async reEvaluateResponse(question: string, answer: string): Promise<{ score: number, reasoning: string }> {
        if (!this.apiKey || !this.ai) return { score: 0, reasoning: "AI Service Unavailable" };
        try {
            const prompt = `
                You are an impartial automated evaluator re-evaluating an answer.
                
                Question: "${question}"
                Answer: "${answer}"
                
                Evaluate the answer strictly but fairly on a scale of 0-100.
                Return JSON: { "score": number, "reasoning": "concise explanation" }
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.INTEGER },
                            reasoning: { type: Type.STRING }
                        }
                    }
                }
            });

            if (response.text) {
                return JSON.parse(response.text);
            }
            return { score: 0, reasoning: "Re-evaluation failed to parse." };
        } catch (error) {
            console.error("GeminiService: Failed to re-evaluate response", error);
            return { score: 0, reasoning: "Re-evaluation error." };
        }
    }
}

export const geminiService = new GeminiService();
