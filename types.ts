
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
    createdAt: string;
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
    templateName?: string;
    templateDifficulty?: string;
    templateSkills?: string; // JSON array string
    templateDescription?: string;
    certificate?: Certificate;
    isCertified?: boolean;
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
    runId: string;
    agentId: string;
    agentName: string;
    templateName?: string;
    score: number;
    status: 'active' | 'revoked';
    issuedAt: string;
    issuedBy?: string;
    dataHash: string;
    agentSnapshot?: string; // JSON string with agent summary at issuance time
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

export interface AgentSkill {
    name: string;
    declaredLevel: string;
    evidence: string;
}

export interface AgentSkillClaim {
    skillId: string;
    proficiencyClaim: string;
    evidence: string;
    status: string;
    createdAt: string;
}

export interface AgentSummary {
    id: number;
    agentId: string;
    name: string;
    version: string;
    createdAt: string;
    skillCount: number;
    certificateCount: number;
    latestScore?: number;
}

export interface AgentProfile {
    id: number;
    agentId: string;
    clientRequestId: string;
    name: string;
    version: string;
    fingerprint: string;
    fingerprintMethod: string;
    toolAccess: string;
    skillMdHash: string;
    createdAt: string;
    workspaceFiles?: string; // JSON string
    skills: AgentSkill[];
    skillClaims: AgentSkillClaim[];
    certificates: Certificate[];
}

export interface AgentUpdate {
    name?: string;
    version?: string;
    workspaceFiles?: string; // JSON string
}