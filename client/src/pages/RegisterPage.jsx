import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscore only'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/auth/register', data);
            login(response.data, response.data.token);
            toast.success('Neural identity stabilized!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Stabilization failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 animate-page">
            <h2 className="text-3xl font-bold text-center mb-2 serif">Join the Nexus</h2>
            <p className="text-center text-gray-400 text-sm mb-10 italic">Initialize your reader identity.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Universal Name</label>
                    <input
                        {...register('name')}
                        type="text"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition font-medium text-gray-900"
                        placeholder="e.g., Alex Rivers"
                    />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Identity Handle</label>
                    <input
                        {...register('username')}
                        type="text"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition font-medium text-gray-900"
                        placeholder="e.g., alex_reads"
                    />
                    {errors.username && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.username.message}</p>}
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Neural Mail</label>
                    <input
                        {...register('email')}
                        type="email"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition font-medium text-gray-900"
                        placeholder="you@domain.com"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Security Key</label>
                    <input
                        {...register('password')}
                        type="password"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition font-medium text-gray-900"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all disabled:opacity-50 mt-4"
                >
                    {isSubmitting ? 'Initializing...' : 'Initialize Identity'}
                </button>
            </form>

            <p className="text-center mt-10 text-xs font-bold uppercase tracking-widest text-gray-400">
                Already indexed?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700">Access Key Vault</Link>
            </p>
        </div>
    );
};

export default RegisterPage;
