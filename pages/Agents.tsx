import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Badge } from '../components/ui/Common';
import { AgentSummary } from '../types';
import { agentService } from '../services/AgentService';
import { useNavigate } from 'react-router-dom';

export const Agents: React.FC = () => {
    const navigate = useNavigate();
    const [agents, setAgents] = useState<AgentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const data = await agentService.getAgents();
                setAgents(data);
            } catch (err) {
                console.error("Failed to load agents", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadAgents();
    }, []);

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white">Registered Agents</h1>
                        <p className="text-slate-400">Directory of all AI agents registered with the platform.</p>
                    </div>
                </div>

                <div className="w-full md:w-96">
                    <Input
                        icon="search"
                        placeholder="Search Agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#111620]"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-slate-500">Loading agents...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent) => (
                            <Card
                                key={agent.agentId}
                                className="p-6 cursor-pointer hover:border-primary/50 transition-all group flex flex-col h-full"
                                onClick={() => navigate(`/agents/${agent.agentId}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors">
                                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {agent.latestScore !== undefined ? (
                                            <Badge type={agent.latestScore >= 70 ? 'pass' : 'fail'}>
                                                Score: {agent.latestScore}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-slate-500 bg-surface-dark px-2 py-1 rounded">No Runs</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4 flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{agent.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono mb-2">{agent.version}</p>
                                    <p className="text-xs text-slate-600 font-mono truncate" title={agent.agentId}>{agent.agentId}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs text-center">Skills</span>
                                        <span className="text-white text-lg font-bold text-center">{agent.skillCount}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-surface-border">
                                        <span className="text-slate-500 text-xs text-center">Certificates</span>
                                        <span className="text-white text-lg font-bold text-center">{agent.certificateCount}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && filteredAgents.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No agents found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </Layout>
    );
};
