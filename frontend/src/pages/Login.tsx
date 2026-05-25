import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Leaf } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      login(response.data);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FDFBF7]">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden w-1/2 lg:block relative p-6">
        <div className="h-full w-full relative overflow-hidden rounded-[40px] shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop" 
            alt="Farm"
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1612] via-[#2B1612]/30 to-transparent opacity-90" />
          <div className="absolute bottom-16 left-16 right-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {t('onboarding.title1')}
            </h2>
            <p className="mt-6 text-xl text-white/80 font-medium max-w-md">
              {t('onboarding.subtitle1')}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 px-8 py-12 relative overflow-hidden">
        {/* Mobile background (only visible on small screens) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-[#2B1612]/70 backdrop-blur-md lg:hidden" />
        
        {/* Subtle kikoy pattern background for web */}
        <div className="hidden lg:block absolute inset-0 bg-pattern-kikoy opacity-30 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-10 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 mb-8 relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-kenya shadow-xl shadow-[#008D41]/30">
                <Leaf className="text-white absolute bottom-2 right-2 opacity-20" size={32} />
                <span className="text-4xl font-black text-white">M</span>
              </div>
              <h1 className="text-4xl font-black text-white lg:text-[#2B1612] tracking-tighter">{t('login.welcome')}</h1>
              <p className="mt-2 text-lg text-white/80 lg:text-[#2B1612]/60 font-medium">{t('login.subtitle')}</p>
            </div>

            <GlassCard variant="light" className="lg:bg-white lg:shadow-xl lg:shadow-[#008D41]/5 lg:border-[#F4ECE1] p-8 rounded-[32px]">
              <form onSubmit={handleLogin} className="space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-2 ml-2">{t('login.emailLabel')}</label>
                  <Input 
                    type="email" 
                    placeholder={t('login.emailPlaceholder')} 
                    icon={<Mail size={20} className="text-[#2B1612]/40" />} 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lg:bg-[#FDFBF7] lg:border-[#F4ECE1] text-[#2B1612]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-2 ml-2">{t('login.passwordLabel')}</label>
                  <Input 
                    type="password" 
                    placeholder={t('login.passwordPlaceholder')}
                    icon={<Lock size={20} className="text-[#2B1612]/40" />} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lg:bg-[#FDFBF7] lg:border-[#F4ECE1] text-[#2B1612]"
                  />
                </div>
                
                <div className="flex justify-end mt-2">
                  <button type="button" className="text-sm font-bold text-white lg:text-[#E32636] hover:text-[#A8E063] lg:hover:text-[#008D41] transition-colors">
                    {t('login.forgotPassword')}
                  </button>
                </div>

                <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-gradient-kenya text-white font-bold text-lg shadow-lg shadow-[#008D41]/30 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? 'Logging in...' : t('login.loginButton')} {!isLoading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="mt-8 text-center text-base font-medium text-white/80 lg:text-[#2B1612]/60">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="font-black text-[#A8E063] lg:text-[#008D41] hover:underline">
                  {t('login.signupText')}
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
