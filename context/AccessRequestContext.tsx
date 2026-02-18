import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AccessRequest } from '../types';

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
            addRequest: () => { },
            markAsRead: () => { },
            unreadCount: 0
        };
    }
    return context;
};

export const AccessRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<AccessRequest[]>([]);

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