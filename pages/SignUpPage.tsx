import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { signUp } from '../store/slices/authSlice';
import { Button } from '../components/ui/Common';

export const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setValidationError("Password must be at least 6 characters");
            return;
        }

        const resultAction = await dispatch(signUp({ email, password }));
        if (signUp.fulfilled.match(resultAction)) {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
                <div className="w-full max-w-md z-10 animate-fade-in-up text-center">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 ring-1 ring-emerald-500/20">
                        <span className="material-symbols-outlined text-[32px]">check_mail</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                        We've sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                        Please click the link to verify your account.
                    </p>
                    <Link to="/login">
                        <Button variant="secondary" className="w-full justify-center">Return to Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-glow ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-[24px]">person_add</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-slate-400 mt-2">Get started with Verifiable AI Certification</p>
                </div>

                <div className="bg-[#151c2a] border border-slate-700 rounded-xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || validationError) && (
                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error || validationError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-[#1a2332] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1a2332] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1a2332] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full justify-center py-2.5"
                            isLoading={isLoading}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
