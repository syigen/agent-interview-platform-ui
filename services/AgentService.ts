
import { AgentSummary, AgentProfile, AgentUpdate } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/agents`;

class AgentService {
    async getAgents(): Promise<AgentSummary[]> {
        const response = await fetch(`${API_BASE_URL}/profiles`);
        if (!response.ok) {
            throw new Error('Failed to fetch agents');
        }
        return response.json();
    }

    async getAgentProfile(agentId: string): Promise<AgentProfile> {
        const response = await fetch(`${API_BASE_URL}/${agentId}/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch agent profile');
        }
        return response.json();
    }

    async updateAgent(agentId: string, data: AgentUpdate): Promise<AgentProfile> {
        const response = await fetch(`${API_BASE_URL}/${agentId}/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update agent');
        }
        return response.json();
    }
}

export const agentService = new AgentService();
