import { apiFetch } from './apiClient';
import { AgentProfile, Certificate } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

export const PublicService = {
    getAgentProfile: async (agentId: string): Promise<AgentProfile> => {
        const response = await apiFetch(`${API_BASE_URL}/public/agents/${agentId}`);
        if (!response.ok) throw new Error('Failed to fetch agent profile');
        return response.json();
    },

    getCertificate: async (certId: string): Promise<Certificate> => {
        const response = await apiFetch(`${API_BASE_URL}/public/certificates/${certId}`);
        if (!response.ok) throw new Error('Failed to fetch certificate');
        return response.json();
    }
};
