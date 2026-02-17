export interface Run {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'in_progress' | 'running';
  score?: number;
}

export interface Criterion {
    id: string;
    prompt: string;
    expected: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'auto' | 'manual';
  skills: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  criteria?: Criterion[];
  lastUpdated: string;
}

export interface Metric {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
}