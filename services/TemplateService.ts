
import { Template } from '../types';

const API_BASE_URL = '/api/templates';

class TemplateService {
    async getTemplates(): Promise<Template[]> {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch templates');
        }
        return response.json();
    }

    async getTemplate(id: string): Promise<Template> {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch template');
        }
        return response.json();
    }

    async createTemplate(templateData: Omit<Template, 'id' | 'lastUpdated'>): Promise<Template> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) {
            throw new Error('Failed to create template');
        }
        return response.json();
    }

    async updateTemplate(id: string, templateData: Partial<Template>): Promise<Template> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) {
            throw new Error('Failed to update template');
        }
        return response.json();
    }

    async deleteTemplate(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete template');
        }
    }

    async duplicateTemplate(id: string, newName: string): Promise<Template> {
        // Fetch original
        const original = await this.getTemplate(id);

        // Prepare new data
        const { id: _, lastUpdated: __, ...rest } = original;
        const newData = {
            ...rest,
            name: newName,
            status: 'draft', // Reset status for duplicate
        };

        // Create new
        return this.createTemplate(newData as any);
    }
}

export const templateService = new TemplateService();
