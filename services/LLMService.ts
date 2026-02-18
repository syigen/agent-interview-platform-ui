
export class LLMService {
    private baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/ai`;

    /**
     * Generates evaluation criteria based on a template profile.
     */
    async generateCriteria(data: { name: string, description: string, skills: string[], difficulty: string }): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/generate-criteria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                console.error("LLMService: Failed to generate criteria", response.statusText);
                return [];
            }

            const result = await response.json();
            return result.criteria || [];
        } catch (error) {
            console.error("LLMService: Error generating criteria", error);
            return [];
        }
    }

    /**
     * Simulates an agent's response to a specific question based on its persona.
     */
    async simulateAgentResponse(data: { skills: string[], description: string }, question: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/simulate-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, question })
            });

            if (!response.ok) return "Error generating response.";

            const result = await response.json();
            return result.response || "I cannot answer that.";
        } catch (error) {
            console.error("LLMService: Error simulating response", error);
            return "Error generating response.";
        }
    }

    /**
     * Evaluates an agent's response against expected criteria.
     */
    async evaluateResponse(question: string, expected: string, actual: string): Promise<{ score: number, reasoning: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/evaluate-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, expected, actual })
            });

            if (!response.ok) return { score: 0, reasoning: "Evaluation service error." };

            return await response.json();
        } catch (error) {
            console.error("LLMService: Error evaluating response", error);
            return { score: 0, reasoning: "Evaluation error." };
        }
    }

    /**
     * Re-evaluates a response without specific expected criteria (blind grading based on quality).
     */
    async reEvaluateResponse(question: string, answer: string): Promise<{ score: number, reasoning: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/re-evaluate-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, answer })
            });

            if (!response.ok) return { score: 0, reasoning: "Re-evaluation service error." };

            return await response.json();
        } catch (error) {
            console.error("LLMService: Error re-evaluating response", error);
            return { score: 0, reasoning: "Re-evaluation error." };
        }
    }
}

export const llmService = new LLMService();
