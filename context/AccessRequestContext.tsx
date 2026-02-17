import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface AccessRequestContextType {
    requests: AccessRequest[];
    addRequest: (req: Omit<AccessRequest, 'id' | 'timestamp' | 'status'>) => void;
    markAsRead: (id: string) => void;
    unreadCount: number;
}

const AccessRequestContext = createContext<AccessRequestContextType | undefined>(undefined);

export const useAccessRequests = () => {
    const context = useContext(AccessRequestContext);
    if (!context) {
        // Fallback for when provider is missing (e.g. during initial render/tests) or if used outside
        return {
            requests: [],
            addRequest: () => {},
            markAsRead: () => {},
            unreadCount: 0
        };
    }
    return context;
};

export const AccessRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<AccessRequest[]>([
        {
            id: 'req-1',
            certificateId: 'CERT-8921-XJY',
            certificateName: 'gpt-4o-mini-custom-v3',
            requesterName: 'Cyberdyne Systems',
            requesterContact: 'compliance@cyberdyne.net',
            message: 'Requiring full audit logs for integration safety check.',
            timestamp: '10 mins ago',
            status: 'unread'
        },
        {
            id: 'req-2',
            certificateId: 'CERT-1102-MKA',
            certificateName: 'Medical-Triage-v2',
            requesterName: 'General Hospital IT',
            requesterContact: 'admin@genhospital.org',
            message: 'Verification of HIPAA compliance benchmarks.',
            timestamp: '2 hours ago',
            status: 'read'
        }
    ]);

    const addRequest = (req: Omit<AccessRequest, 'id' | 'timestamp' | 'status'>) => {
        const newReq: AccessRequest = {
            ...req,
            id: `req-${Date.now()}`,
            timestamp: 'Just now',
            status: 'unread'
        };
        setRequests(prev => [newReq, ...prev]);
    };

    const markAsRead = (id: string) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'read' } : r));
    };

    const unreadCount = requests.filter(r => r.status === 'unread').length;

    return (
        <AccessRequestContext.Provider value={{ requests, addRequest, markAsRead, unreadCount }}>
            {children}
        </AccessRequestContext.Provider>
    );
};