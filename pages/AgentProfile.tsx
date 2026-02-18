import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Badge, Input } from '../components/ui/Common';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../services/AgentService';
import { AgentProfile, AgentUpdate } from '../types';

export const AgentProfileDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<AgentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'workspace'>('overview');
    const [isEditing, setIsEditing] = useState(false);

    // Edit state
    const [editName, setEditName] = useState('');
    const [editVersion, setEditVersion] = useState('');

    useEffect(() => {
        if (!id) return;
        const loadProfile = async () => {
            try {
                const data = await agentService.getAgentProfile(id);
                setProfile(data);
                setEditName(data.name);
                setEditVersion(data.version);
            } catch (err) {
                console.error("Failed to load profile", err);
                setError("Failed to load agent profile.");
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [id]);

    const handleSave = async () => {
        if (!profile) return;
        try {
            const update: AgentUpdate = {
                name: editName,
                version: editVersion
            };
            const updatedProfile = await agentService.updateAgent(profile.agentId, update);
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            // Optionally show error toast
        }
    };

    if (isLoading) return <Layout><div className="p-12 text-center text-slate-500">Loading profile...</div></Layout>;
    if (error || !profile) return <Layout><div className="p-12 text-center text-red-500">{error || "Agent not found"}</div></Layout>;

    // Parse workspace files
    let workspaceFiles: Record<string, string> = {};
    try {
        if (profile.workspaceFiles) {
            workspaceFiles = JSON.parse(profile.workspaceFiles);
        }
    } catch (e) {
        console.error("Failed to parse workspace files", e);
    }
    const fileNames = Object.keys(workspaceFiles);

    return (
        <Layout>
            <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-surface-border">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-4xl">smart_toy</span>
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex flex-col gap-2 mb-2">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Agent Name"
                                        className="text-2xl font-bold"
                                    />
                                    <Input
                                        value={editVersion}
                                        onChange={(e) => setEditVersion(e.target.value)}
                                        placeholder="Version"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-black text-white">{profile.name}</h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge type="neutral" icon="tag">{profile.version}</Badge>
                                        <span className="text-slate-500 text-sm font-mono">{profile.agentId}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button icon="save" onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                            <Button variant="secondary" icon="edit" onClick={() => setIsEditing(true)}>Edit Details</Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-surface-border">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'skills' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Skills & Claims
                    </button>
                    <button
                        onClick={() => setActiveTab('workspace')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'workspace' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Workspace Files
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in-up">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">verified</span>
                                    Issued Certificates
                                </h3>
                                {profile.certificates.length > 0 ? (
                                    <div className="space-y-3">
                                        {profile.certificates.map(cert => (
                                            <div key={cert.id} className="p-3 rounded bg-surface-dark border border-surface-border flex justify-between items-center cursor-pointer hover:bg-surface-hover transition-colors"
                                                onClick={() => navigate(`/certificate/${cert.id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${cert.score >= 90 ? 'bg-emerald-500/20 text-emerald-500' : cert.score >= 70 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                                                        {cert.score}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{cert.templateName || 'Standard Eval'}</p>
                                                        <p className="text-slate-500 text-xs">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic">No certificates issued yet.</p>
                                )}
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">fingerprint</span>
                                    Identity & Security
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Fingerprint</label>
                                        <div className="font-mono text-sm text-slate-300 bg-black/30 p-2 rounded border border-white/5 break-all mt-1">
                                            {profile.fingerprint}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold">Method</label>
                                            <p className="text-white">{profile.fingerprintMethod}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold">Registered</label>
                                            <p className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Tool Access</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {profile.toolAccess.split(',').map(tool => (
                                                <span key={tool} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                                                    {tool.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="flex flex-col gap-6">
                            {/* Registered Skills */}
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Registered Skills</h3>
                                {profile.skills.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {profile.skills.map((skill, idx) => (
                                            <div key={idx} className="p-4 rounded-lg bg-surface-dark border border-surface-border">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-white">{skill.name}</span>
                                                    <Badge type="neutral">{skill.declaredLevel}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2">{skill.evidence}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No registered skills.</p>
                                )}
                            </Card>

                            {/* Skill Claims */}
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Skill Claims</h3>
                                {profile.skillClaims.length > 0 ? (
                                    <div className="divide-y divide-surface-border">
                                        {profile.skillClaims.map((claim, idx) => (
                                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                                                <div>
                                                    <h4 className="font-bold text-white mb-1">{claim.skillId}</h4>
                                                    <p className="text-sm text-slate-400">{claim.evidence}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge type="neutral">{claim.proficiencyClaim}</Badge>
                                                    <Badge type={claim.status === 'VERIFIED' ? 'pass' : 'neutral'}>{claim.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No additional skill claims.</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'workspace' && (
                        <Card className="flex flex-col md:flex-row overflow-hidden min-h-[500px]">
                            {/* File List */}
                            <div className="w-full md:w-64 bg-surface-dark border-r border-surface-border flex flex-col">
                                <div className="p-4 border-b border-surface-border font-bold text-slate-400 text-sm uppercase">Files</div>
                                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                    {fileNames.length > 0 ? (
                                        fileNames.map(fileName => (
                                            <WorkspaceFileItem
                                                key={fileName}
                                                fileName={fileName}
                                                isSelected={false} // TODO: Add selection state
                                                onClick={() => { /* TODO: Implement selection */ }}
                                            />
                                        ))
                                    ) : (
                                        <div className="p-4 text-xs text-slate-500 italic">No workspace files found.</div>
                                    )}
                                </div>
                            </div>
                            {/* File Preview */}
                            <div className="flex-1 bg-[#0d1117] p-0 flex flex-col">
                                {/* Simple implementation: just show all files stacked for now or implement selection state later if needed. 
                                     Actually, let's implement local state for selection. 
                                 */}
                                <WorkspaceFileViewer files={workspaceFiles} />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
};

// Sub-components for Workspace Viewer
const WorkspaceFileItem: React.FC<{ fileName: string, isSelected: boolean, onClick: () => void }> = ({ fileName, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${isSelected ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        <span className="material-symbols-outlined text-xs">description</span>
        <span className="truncate">{fileName}</span>
    </button>
);

const WorkspaceFileViewer: React.FC<{ files: Record<string, string> }> = ({ files }) => {
    const fileNames = Object.keys(files);
    const [selectedFile, setSelectedFile] = useState<string | null>(fileNames.length > 0 ? fileNames[0] : null);

    if (fileNames.length === 0) return <div className="flex-1 flex items-center justify-center text-slate-500">No content</div>;

    return (
        <div className="flex h-full">
            <div className="w-64 bg-surface-dark border-r border-surface-border flex flex-col hidden md:flex">
                {/* Re-implementing correctly to share state - actually the parent structure was already splitting 
                    Let's just use this component to handle both list and view for simplicity within the tab content 
                */}
            </div>
            {/* 
                Refactoring: simpler to just have one component handling state 
                Let's override the parent render structure slightly
             */}
            <div className="w-64 bg-surface-dark border-r border-surface-border flex flex-col shrink-0">
                <div className="p-4 border-b border-surface-border font-bold text-slate-400 text-sm uppercase">Files</div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {fileNames.map(fileName => (
                        <button
                            key={fileName}
                            onClick={() => setSelectedFile(fileName)}
                            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${selectedFile === fileName ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-symbols-outlined text-xs">description</span>
                            <span className="truncate">{fileName}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
                {selectedFile ? (
                    <>
                        <div className="p-3 border-b border-white/5 bg-[#161b22] flex justify-between items-center">
                            <span className="text-sm font-mono text-slate-300">{selectedFile}</span>
                            <Badge type="neutral" className="text-[10px]">Read Only</Badge>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{files[selectedFile]}</pre>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">Select a file to view</div>
                )}
            </div>
        </div>
    );
}
