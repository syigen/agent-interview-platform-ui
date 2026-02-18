
import { Run } from '../types';
import { apiFetch } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/runs`;

class RunService {
    async getRuns(): Promise<Run[]> {
        const response = await apiFetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch runs');
        }
        return response.json();
    }

    async getRun(id: string): Promise<Run> {
        const response = await apiFetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch run');
        }
        return response.json();
    }

    async createRun(runData: Partial<Run>): Promise<Run> {
        const response = await apiFetch(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(runData),
        });
        if (!response.ok) {
            throw new Error('Failed to create run');
        }
        return response.json();
    }

    async updateRun(id: string, runData: Partial<Run>): Promise<Run> {
        const response = await apiFetch(API_BASE_URL + `/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(runData),
        });
        if (!response.ok) {
            throw new Error('Failed to update run');
        }
        return response.json();
    }

    async addStep(runId: string, stepData: any): Promise<any> {
        const response = await apiFetch(API_BASE_URL + `/${runId}/steps`, {
            method: 'POST',
            body: JSON.stringify(stepData),
        });
        if (!response.ok) {
            throw new Error('Failed to add step');
        }
        return response.json();
    }
    async updateStep(runId: string, stepId: string, stepData: any): Promise<any> {
        // Ensure gradingHistory is included if present, as it might be needed for the backend to update correctly
        const response = await apiFetch(`${API_BASE_URL}/${runId}/steps/${stepId}`, {
            method: 'PATCH',
            body: JSON.stringify(stepData),
        });
        if (!response.ok) {
            throw new Error('Failed to update step');
        }
        return response.json();
    }

    async issueCertificate(runId: string): Promise<any> {
        const response = await apiFetch(`${API_BASE_URL}/${runId}/certificate`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to issue certificate');
        }
        return response.json();
    }

    async getCertificate(runId: string): Promise<any> {
        const response = await apiFetch(`${API_BASE_URL}/${runId}/certificate`);
        if (!response.ok) {
            throw new Error('Failed to fetch certificate');
        }
        return response.json();
    }
}

export const runService = new RunService();
