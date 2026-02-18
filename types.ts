
export interface Metric {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    onClick?: () => void;
    status?: 'success' | 'warning' | 'neutral' | 'info';
}

export interface GradeEntry {
    source: 'ai' | 'human';
    score: number;
    reasoning?: string;
    timestamp: string;
    isSelected?: boolean;
    electedAt?: string;
}

export interface ChatStep {
    id: string;
    role: 'interviewer' | 'agent' | 'system';
    content: string;
    timestamp: string;
    status?: 'pass' | 'fail' | 'info';
    metadata?: Record<string, string>;
    score?: number;
    category?: string;
    isHumanGraded?: boolean;
    humanNote?: string;
    gradingHistory?: GradeEntry[];
}

export interface Run {
    id: string;
    agentId: string;
    agentName: string;
    timestamp: string;
    status: 'pass' | 'fail' | 'in_progress' | 'running';
    score?: number;
    steps?: ChatStep[];
    totalSteps?: number;
}

export interface Criterion {
    id: string;
    prompt: string;
    expected: string;
    minScore: number;
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    type: 'auto' | 'manual';
    status: 'draft' | 'private' | 'public';
    skills: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    criteria?: Criterion[];
    lastUpdated: string;
}

export interface Certificate {
    id: string;
    agent: string;
    date: string;
    score: number;
    template: string;
}

export interface AccessRequest {
    id: string;
    certificateId: string;
    certificateName: string;
    requesterName: string;
    requesterContact: string;
    message: string;
    timestamp: string;
    status: 'unread' | 'read';
}