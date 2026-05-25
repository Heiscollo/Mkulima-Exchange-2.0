import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Lock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Settings() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    orderUpdates: true,
    twoFactor: false,
    privateProfile: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingsOptions = [
    {
      key: 'notifications' as const,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Receive notifications about orders and updates',
    },
    {
      key: 'emailUpdates' as const,
      icon: Bell,
      title: 'Email Updates',
      description: 'Receive email updates about new products',
    },
    {
      key: 'orderUpdates' as const,
      icon: Bell,
      title: 'Order Updates',
      description: 'Get notifications on order status changes',
    },
    {
      key: 'twoFactor' as const,
      icon: Lock,
      title: 'Two-Factor Authentication',
      description: 'Add extra security to your account',
    },
    {
      key: 'privateProfile' as const,
      icon: Eye,
      title: 'Private Profile',
      description: 'Hide your profile from other users',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="p-2.5 hover:bg-[#F4ECE1] rounded-xl transition-colors text-[#2B1612]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-[#2B1612]">{t('profile.settings')}</h1>
        </div>

        {/* Language Settings */}
        <div className="rounded-[32px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-8 mb-8">
          <h2 className="text-lg font-bold text-[#2B1612] mb-6">Language</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                language === 'en'
                  ? 'bg-gradient-kenya text-white'
                  : 'border-2 border-[#F4ECE1] text-[#2B1612] hover:border-[#008D41]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                language === 'sw'
                  ? 'bg-gradient-kenya text-white'
                  : 'border-2 border-[#F4ECE1] text-[#2B1612] hover:border-[#008D41]'
              }`}
            >
              Swahili
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-[32px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-8 mb-8">
          <h2 className="text-lg font-bold text-[#2B1612] mb-6">Preferences</h2>
          <div className="space-y-4">
            {settingsOptions.map(({ key, icon: Icon, title, description }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FDFBF7] transition-colors border border-transparent hover:border-[#F4ECE1]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#008D41]/10 rounded-lg text-[#008D41]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2B1612]">{title}</h3>
                    <p className="text-sm text-[#2B1612]/60">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    settings[key]
                      ? 'bg-[#008D41] text-white'
                      : 'bg-[#F4ECE1] text-[#2B1612]'
                  }`}
                >
                  {settings[key] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-[32px] bg-red-50 shadow-sm border border-red-200 p-8">
          <h2 className="text-lg font-bold text-red-600 mb-6">Danger Zone</h2>
          <button className="w-full px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all">
            Delete Account
          </button>
          <p className="text-xs text-red-600/70 mt-3">
            This action cannot be undone. Please be certain before proceeding.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
