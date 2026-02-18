import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicService } from '../services/PublicService';
import { Certificate } from '../types';

const PublicCertificate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCertificate(id);
        }
    }, [id]);

    const fetchCertificate = async (certId: string) => {
        setLoading(true);
        try {
            const data = await PublicService.getCertificate(certId);
            setCertificate(data);
        } catch (err) {
            console.error("Failed to fetch certificate", err);
            setError("Certificate not found or invalid.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Verifying certificate...</div>;
    if (error || !certificate) return (
        <div className="container mx-auto p-12 max-w-2xl text-center">
            <div className="inline-block p-4 rounded-full bg-red-100 text-red-500 mb-4">
                <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600">{error || "Certificate could not be verified."}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white shadow-xl rounded-xl p-8 max-w-3xl w-full border border-gray-200 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-9xl">verified</span>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 text-green-600 mb-4">
                        <span className="material-symbols-outlined text-3xl">verified</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide uppercase">Certificate of Excellence</h1>
                    <p className="text-gray-500 mt-2">Verified Authenticity</p>
                </div>

                <div className="mb-8 text-center space-y-2">
                    <p className="text-lg text-gray-600">This certifies that</p>
                    <h2 className="text-4xl font-bold text-gray-900 py-2">{certificate.agent_name}</h2>
                    <p className="text-lg text-gray-600">has successfully completed the assessment for</p>
                    <h3 className="text-2xl font-bold text-indigo-700">{certificate.template_name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b border-gray-100 py-6 mb-8 text-center">
                    <div>
                        <div className="text-xs uppercase font-bold text-gray-400">Score</div>
                        <div className="text-2xl font-bold text-gray-900">{certificate.score}%</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase font-bold text-gray-400">Issued On</div>
                        <div className="text-lg font-medium text-gray-900">
                            {new Date(certificate.issued_at).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase font-bold text-gray-400">Certificate ID</div>
                        <div className="text-xs font-mono text-gray-600 mt-1 break-all">{certificate.id}</div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">fingerprint</span>
                        <span className="font-mono text-xs">{certificate.data_hash.substring(0, 16)}...</span>
                    </div>
                    <div>
                        Issued by <span className="font-semibold text-gray-700">Interview Board</span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <a href={`/public/agents/${certificate.agent_id}`} className="text-blue-600 hover:underline text-sm">
                        View Agent Profile
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PublicCertificate;
