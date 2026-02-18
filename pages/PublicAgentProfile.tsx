import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicService } from '../services/PublicService';
import { AgentProfile } from '../types';

const PublicAgentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<AgentProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProfile(id);
        }
    }, [id]);

    const fetchProfile = async (agentId: string) => {
        setLoading(true);
        try {
            const data = await PublicService.getAgentProfile(agentId);
            setProfile(data);
        } catch (err) {
            console.error("Failed to fetch agent profile", err);
            setError("Agent not found or access denied.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (error || !profile) return <div className="p-8 text-center text-red-500">{error || "Profile not found"}</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 flex items-center gap-6">
                <div className="size-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {profile.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                    <p className="text-gray-500 font-mono text-sm">ID: {profile.agent_id}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">v{profile.version || '1.0.0'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Verified Skills</h2>
                    {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <span key={skill.skill_id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    {skill.skill_id}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No verified skills yet.</p>
                    )}

                    <h3 className="text-lg font-semibold mt-6 mb-3 border-b pb-1">Skill Claims</h3>
                    {profile.skill_claims && profile.skill_claims.length > 0 ? (
                        <ul className="space-y-3">
                            {profile.skill_claims.map((claim, idx) => (
                                <li key={idx} className="p-3 bg-gray-50 rounded">
                                    <div className="font-medium">{claim.skill_id}</div>
                                    <div className="text-sm text-gray-600">Level: {claim.proficiency_claim}</div>
                                    <div className="text-xs text-gray-400 mt-1">Status: {claim.status}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No pending claims.</p>
                    )}
                </div>

                {/* Certificates */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Certificates</h2>
                    {profile.certificates && profile.certificates.length > 0 ? (
                        <div className="space-y-4">
                            {profile.certificates.map(cert => (
                                <div key={cert.id} className="border rounded p-4 border-l-4 border-l-gold-500 hover:shadow-md transition">
                                    <div className="font-bold text-lg">{cert.template_name}</div>
                                    <div className="text-sm text-gray-600">
                                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                                            Score: {cert.score}%
                                        </span>
                                        <a href={`/public/certificates/${cert.id}`} className="text-blue-600 text-sm hover:underline">
                                            View Certificate
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No certificates earned yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicAgentProfile;
