
import { Certificate } from '../types';
import { apiFetch } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/certificates`;

class CertificateService {
    async getCertificates(): Promise<Certificate[]> {
        const response = await apiFetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch certificates');
        }
        return response.json();
    }
    async getCertificate(id: string): Promise<Certificate> {
        const response = await apiFetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch certificate');
        }
        return response.json();
    }
}

export const certificateService = new CertificateService();
