import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    React.useEffect(() => {
        const authError = sessionStorage.getItem('auth_error');
        if (authError) {
            toast.error(authError, { duration: 6000 });
            sessionStorage.removeItem('auth_error');
        }
    }, []);

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/auth/login', data);
            login(response.data, response.data.token);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-10 card-libra animate-page">
            <h2 className="text-3xl font-bold text-center mb-2 serif text-ink-900">Welcome Back</h2>
            <p className="text-center text-ink-600 text-sm mb-10 italic">Sign in to access your library.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5 block ml-1">Email Address</label>
                    <input
                        {...register('email')}
                        type="email"
                        className="w-full px-5 py-4 input-libra rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition font-medium"
                        placeholder="you@domain.com"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5 block ml-1">Password</label>
                    <input
                        {...register('password')}
                        type="password"
                        className="w-full px-5 py-4 input-libra rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition font-medium"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.password.message}</p>}
                </div>


                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-4"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="text-center mt-12 text-xs font-bold uppercase tracking-widest text-ink-400">
                New to Bookverse?{' '}
                <Link to="/register" className="text-teal-600 hover:text-teal-700">Create Account</Link>
            </p>
        </div>
    );
};

export default LoginPage;
