import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Template } from '../../types';

interface TemplateState {
  items: Template[];
}

const defaultTemplates: Template[] = [
    {
        id: 'TMP-2940',
        name: 'Customer Support Logic V2',
        description: 'Standard evaluation for L1 customer support agents focusing on empathy, reasoning, and de-escalation techniques.',
        type: 'manual',
        status: 'public',
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
        status: 'private',
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
        status: 'public',
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
        status: 'draft',
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
        status: 'private',
        skills: ['Ethics', 'Safety', 'Policy'],
        difficulty: 'Medium',
        lastUpdated: 'Nov 05, 2023',
        criteria: []
    }
];

const initialState: TemplateState = {
  items: defaultTemplates,
};

export const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Omit<Template, 'id' | 'lastUpdated'>>) => {
      const newTemplate: Template = {
        ...action.payload,
        id: `TMP-${Math.floor(1000 + Math.random() * 9000)}`,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      state.items.unshift(newTemplate);
    },
    updateTemplate: (state, action: PayloadAction<{ id: string; changes: Partial<Template> }>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.changes,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    // We pass the new ID in the payload so the component knows where to navigate
    duplicateTemplate: (state, action: PayloadAction<{ id: string, newId: string }>) => {
      const templateToClone = state.items.find(t => t.id === action.payload.id);
      if (templateToClone) {
        let newName = `${templateToClone.name} (Copy)`;
        let counter = 1;
        while (state.items.some(t => t.name === newName)) {
            counter++;
            newName = `${templateToClone.name} (Copy ${counter})`;
        }

        const newTemplate: Template = {
            ...templateToClone,
            id: action.payload.newId,
            name: newName,
            status: 'draft',
            criteria: templateToClone.criteria ? templateToClone.criteria.map(c => ({...c, id: Math.random().toString(36).substr(2, 9)})) : [],
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        state.items.unshift(newTemplate);
      }
    }
  },
});

export const { addTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = templateSlice.actions;
export default templateSlice.reducer;
