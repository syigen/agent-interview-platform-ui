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
const defaultTemplates: Template[] = [
    {
        id: 'TMP-2940',
        name: 'Customer Support Logic V2',
        description: 'Standard evaluation for L1 customer support agents focusing on empathy, reasoning, and de-escalation techniques.',
        type: 'manual',
        skills: ['Reasoning', 'Tool Use', 'Empathy'],
        difficulty: 'Medium',
        lastUpdated: 'Oct 24, 2023',
        criteria: [
            { id: 'c1', prompt: 'A customer is angry about a late delivery. How do you respond?', expected: 'Apologize, check status, offer compensation if applicable.', minScore: 85 }
        ]
    },
    {
        id: 'TMP-1102',
        name: 'Financial Analyst Basic',
        description: 'Quantitative reasoning assessment for finance bots. Tests ability to interpret CSV data and detect anomalies.',
        type: 'auto',
        skills: ['Math', 'Data Analysis', 'Python'],
        difficulty: 'Hard',
        lastUpdated: 'Oct 20, 2023',
        criteria: []
    },
    {
        id: 'TMP-5591',
        name: 'Creative Writing Assistant',
        description: 'Evaluates creativity, tone consistency, and vocabulary usage in narrative generation tasks.',
        type: 'manual',
        skills: ['Creativity', 'Language', 'Storytelling'],
        difficulty: 'Easy',
        lastUpdated: 'Oct 15, 2023',
        criteria: [
            { id: 'c2', prompt: 'Write a haiku about a crashing server.', expected: 'Must follow 5-7-5 structure and relate to tech.', minScore: 90 }
        ]
    },
    {
        id: 'TMP-8821',
        name: 'Senior React Developer Agent',
        description: 'Advanced technical interview for autonomous coding agents specializing in frontend architecture.',
        type: 'manual',
        skills: ['React', 'TypeScript', 'System Design', 'Performance'],
        difficulty: 'Hard',
        lastUpdated: 'Nov 01, 2023',
        criteria: [
            { id: 'c3', prompt: 'Explain how you would optimize a large data grid component.', expected: 'Virtualization, memoization, proper key usage.', minScore: 80 }
        ]
    },
    {
        id: 'TMP-4402',
        name: 'Ethical Compliance Check',
        description: ' rigorous safety alignment test to ensure the agent refuses harmful instructions.',
        type: 'auto',
        skills: ['Ethics', 'Safety', 'Policy'],
        difficulty: 'Medium',
        lastUpdated: 'Nov 05, 2023',
        criteria: []
    }
];

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<Template[]>(defaultTemplates);

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
            // Create deep copy of criteria to avoid reference issues
            criteria: templateToClone.criteria ? templateToClone.criteria.map(c => ({...c, id: Math.random().toString(36).substr(2, 9)})) : [],
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