import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';

export function EditProfile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Update user context
      updateUser(formData);
      // Navigate back to profile
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="p-2.5 hover:bg-[#F4ECE1] rounded-xl transition-colors text-[#2B1612]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-[#2B1612]">{t('profile.edit')}</h1>
        </div>

        {/* Form */}
        <div className="rounded-[32px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-8">
          {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold mb-6">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#2B1612] mb-2">{t('register.nameLabel')}</label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2B1612] mb-2">{t('register.emailLabel')}</label>
              <Input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
              />
              <p className="text-xs text-[#2B1612]/50 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2B1612] mb-2">{t('register.phoneLabel')}</label>
              <Input
                type="tel"
                placeholder="Your phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#2B1612]/20 text-[#2B1612] font-bold hover:bg-[#F4ECE1] transition-all"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-kenya text-white font-bold hover:scale-[1.02] disabled:opacity-70 transition-all"
              >
                <Save size={20} /> {loading ? 'Saving...' : t('common.save') || 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
