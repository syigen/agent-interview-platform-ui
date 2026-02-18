import { apiFetch } from './apiClient';
import { Run, Certificate } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

export const AgentInterviewService = {
    // Get all agent submissions scoped to the logged-in admin
    getAgentSubmissions: async (): Promise<Run[]> => {
        const response = await apiFetch(`${API_BASE_URL}/runs/agent-submissions`);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        return response.json();
    },

    // Generate an invite prompt for a given template
    generateInvitePrompt: async (templateId: string): Promise<{ token: string; prompt: string }> => {
        const response = await apiFetch(`${API_BASE_URL}/agents/invite-prompt`, {
            method: 'POST',
            body: JSON.stringify({ template_id: templateId })
        });
        if (!response.ok) throw new Error('Failed to generate invite prompt');
        return response.json();
    },

    // Trigger evaluation
    evaluateRun: async (runId: string): Promise<Run> => {
        const response = await apiFetch(`${API_BASE_URL}/runs/${runId}/evaluate`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to evaluate run');
        return response.json();
    },

    // Issue Certificate
    issueCertificate: async (runId: string): Promise<Certificate> => {
        const response = await apiFetch(`${API_BASE_URL}/certificates`, {
            method: 'POST',
            body: JSON.stringify({ run_id: runId })
        });
        if (!response.ok) throw new Error('Failed to issue certificate');
        return response.json();
    }
};

