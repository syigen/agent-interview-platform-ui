
import { Run } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/runs`;

class RunService {
    async getRuns(): Promise<Run[]> {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch runs');
        }
        return response.json();
    }

    async getRun(id: string): Promise<Run> {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch run');
        }
        return response.json();
    }

    async createRun(runData: Partial<Run>): Promise<Run> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(runData),
        });
        if (!response.ok) {
            throw new Error('Failed to create run');
        }
        return response.json();
    }

    async updateRun(id: string, runData: Partial<Run>): Promise<Run> {
        const response = await fetch(API_BASE_URL + `/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(runData),
        });
        if (!response.ok) {
            throw new Error('Failed to update run');
        }
        return response.json();
    }

    async addStep(runId: string, stepData: any): Promise<any> {
        const response = await fetch(API_BASE_URL + `/${runId}/steps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stepData),
        });
        if (!response.ok) {
            throw new Error('Failed to add step');
        }
        return response.json();
    }
}

export const runService = new RunService();
