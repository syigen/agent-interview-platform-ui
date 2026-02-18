import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SettingsPanel } from './SettingsPanel';
import { useAppSelector } from '../store/hooks';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const interviewerName = useAppSelector((state) => state.settings.interviewerName);

    const isActive = (path: string) => location.pathname.startsWith(path) ? 'text-primary' : 'text-slate-400 hover:text-white';

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-white font-display">
            {/* Settings Panel */}
            <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 border-b border-surface-border bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-2xl">verified_user</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">Verifiable AI</h2>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
                        <Link to="/templates" className={`text-sm font-medium transition-colors ${isActive('/templates')}`}>Templates</Link>
                        <Link to="/agents" className={`text-sm font-medium transition-colors ${isActive('/agents')}`}>Agents</Link>
                        <Link to="/runs" className={`text-sm font-medium transition-colors ${isActive('/runs')}`}>Runs</Link>
                        <Link to="/certificates" className={`text-sm font-medium transition-colors ${isActive('/certificates')}`}>Certificates</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Desktop Right Side */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                className="text-slate-400 hover:text-white transition-colors"
                                onClick={() => setIsSettingsOpen(true)}
                            >
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <button className="text-slate-400 hover:text-white transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-2 border-l border-surface-border">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-white">{interviewerName}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin</p>
                                </div>
                                <div className="size-9 rounded-full bg-surface-border bg-cover bg-center border border-slate-700" style={{ backgroundImage: 'url("https://picsum.photos/100/100")' }}></div>
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-slate-400 hover:text-white p-1"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-surface-border bg-background-dark/95 backdrop-blur-xl px-6 py-4 animate-fade-in-up">
                        <nav className="flex flex-col gap-2">
                            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/dashboard')}`}>Dashboard</Link>
                            <Link to="/templates" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/templates')}`}>Templates</Link>
                            <Link to="/agents" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/agents')}`}>Agents</Link>
                            <Link to="/runs" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/runs')}`}>Runs</Link>
                            <Link to="/certificates" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/certificates')}`}>Certificates</Link>

                            <div className="flex items-center justify-between py-3 mt-2" onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}>
                                <span className="text-sm font-medium text-slate-400">Settings</span>
                                <span className="material-symbols-outlined text-slate-400">settings</span>
                            </div>

                            <div className="flex items-center gap-3 py-3 border-t border-surface-border mt-2">
                                <div className="size-10 rounded-full bg-surface-border bg-cover bg-center border border-slate-700" style={{ backgroundImage: 'url("https://picsum.photos/100/100")' }}></div>
                                <div>
                                    <p className="text-sm font-bold text-white">{interviewerName}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Administrator</p>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};