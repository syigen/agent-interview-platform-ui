import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SettingsPanel } from './SettingsPanel';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../store/slices/authSlice';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Auth State
    const { user } = useAppSelector((state) => state.auth);
    // Fallback to settings name if no user (shouldn't happen in protected routes, but good for safety)
    const interviewerName = useAppSelector((state) => state.settings.interviewerName);

    const displayEmail = user?.email || interviewerName;
    const userMenuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname.startsWith(path) ? 'text-primary' : 'text-slate-400 hover:text-white';

    const handleLogout = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                        <Link to="/interviews" className={`text-sm font-medium transition-colors ${isActive('/interviews')}`}>Interviews</Link>
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

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={userMenuRef}>
                                <div
                                    className="flex items-center gap-3 pl-2 border-l border-surface-border cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-white">{displayEmail}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin</p>
                                    </div>
                                    <div className="size-9 rounded-full bg-surface-border bg-cover bg-center border border-slate-700 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 text-primary font-bold text-sm">
                                            {displayEmail.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a2332] border border-surface-border rounded-xl shadow-2xl py-1 overflow-hidden animate-fade-in-up z-50">
                                        <div className="px-4 py-3 border-b border-surface-border/50">
                                            <p className="text-sm font-medium text-white truncate">{displayEmail}</p>
                                            <p className="text-xs text-slate-500">Administrator</p>
                                        </div>

                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setIsSettingsOpen(true);
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">settings</span>
                                                Settings
                                            </button>
                                        </div>

                                        <div className="border-t border-surface-border/50 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">logout</span>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                            <Link to="/interviews" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/interviews')}`}>Interviews</Link>
                            <Link to="/certificates" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-3 border-b border-surface-border/50 ${isActive('/certificates')}`}>Certificates</Link>

                            <div className="flex items-center justify-between py-3 mt-2" onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}>
                                <span className="text-sm font-medium text-slate-400">Settings</span>
                                <span className="material-symbols-outlined text-slate-400">settings</span>
                            </div>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-between py-3 mt-2 text-red-400"
                            >
                                <span className="text-sm font-medium">Sign Out</span>
                                <span className="material-symbols-outlined">logout</span>
                            </button>

                            <div className="flex items-center gap-3 py-3 border-t border-surface-border mt-2">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-slate-700">
                                    {displayEmail.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{displayEmail}</p>
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