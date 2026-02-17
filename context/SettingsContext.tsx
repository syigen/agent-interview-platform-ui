import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    interviewerName: string;
    setInterviewerName: (name: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [interviewerName, setInterviewerName] = useState('Admin User');

    return (
        <SettingsContext.Provider value={{ interviewerName, setInterviewerName }}>
            {children}
        </SettingsContext.Provider>
    );
};