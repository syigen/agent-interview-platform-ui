import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Template } from '../types';

interface TemplateContextType {
    templates: Template[];
    addTemplate: (template: Omit<Template, 'id' | 'lastUpdated'>) => void;
    updateTemplate: (id: string, template: Partial<Template>) => void;
    deleteTemplate: (id: string) => void;
    duplicateTemplate: (id: string) => string | undefined;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplates = () => {
    const context = useContext(TemplateContext);
    if (!context) {
        throw new Error('useTemplates must be used within a TemplateProvider');
    }
    return context;
};

// Default Templates Data with "High-Tech" Feel
const defaultTemplates: Template[] = [];

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<Template[]>([]);

    const addTemplate = (newTemplateData: Omit<Template, 'id' | 'lastUpdated'>) => {
        const newTemplate: Template = {
            ...newTemplateData,
            id: `TMP-${Math.floor(1000 + Math.random() * 9000)}`,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        setTemplates(prev => [newTemplate, ...prev]);
    };

    const updateTemplate = (id: string, updatedData: Partial<Template>) => {
        setTemplates(prev => prev.map(t => t.id === id ? {
            ...t,
            ...updatedData,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        } : t));
    };

    const deleteTemplate = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    const duplicateTemplate = (id: string): string | undefined => {
        const templateToClone = templates.find(t => t.id === id);
        if (!templateToClone) return undefined;

        let newName = `${templateToClone.name} (Copy)`;
        let counter = 1;

        // Ensure unique name
        while (templates.some(t => t.name === newName)) {
            counter++;
            newName = `${templateToClone.name} (Copy ${counter})`;
        }

        const newId = `TMP-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTemplate: Template = {
            ...templateToClone,
            id: newId,
            name: newName,
            status: 'draft', // Draft is default for copies
            // Create deep copy of criteria to avoid reference issues
            criteria: templateToClone.criteria ? templateToClone.criteria.map(c => ({ ...c, id: Math.random().toString(36).substr(2, 9) })) : [],
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        setTemplates(prev => [newTemplate, ...prev]);
        return newId;
    };

    return (
        <TemplateContext.Provider value={{ templates, addTemplate, updateTemplate, deleteTemplate, duplicateTemplate }}>
            {children}
        </TemplateContext.Provider>
    );
};