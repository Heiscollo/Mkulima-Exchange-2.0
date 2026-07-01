import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Settings, MapPin, Phone, Heart, Package, LogOut, ChevronRight, Edit3, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';

export function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const menuItems = useMemo(() => [
    { icon: Package, label: t('profile.orders'), path: '/orders', color: 'text-[#008D41]', bg: 'bg-[#008D41]/10' },
    { icon: Heart, label: t('profile.saved'), path: '/saved', color: 'text-[#E32636]', bg: 'bg-[#E32636]/10' },
    { icon: MapPin, label: t('profile.addresses'), path: '/addresses', color: 'text-[#F7971E]', bg: 'bg-[#F7971E]/10' },
    { icon: ShieldCheck, label: t('profile.payments'), path: '/payments', color: 'text-[#008D41]', bg: 'bg-[#008D41]/10' },
    { icon: Settings, label: t('profile.settings'), path: '/settings', color: 'text-[#2B1612]', bg: 'bg-[#2B1612]/10' },
  ], [t]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Cover Photo & Profile */}
        <div className="relative rounded-[40px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-6 sm:p-10 mb-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-kenya">
            <div className="absolute inset-0 bg-pattern-kikoy opacity-20" />
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" 
              alt="Cover" 
              className="h-full w-full object-cover mix-blend-overlay opacity-60"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 text-center sm:text-left">
          <div className="relative">
              <div className="h-32 w-32 rounded-[32px] border-4 border-white shadow-xl overflow-hidden bg-white">
                <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
              </div>
              <button className="absolute -bottom-2 -right-2 rounded-xl bg-white p-2.5 text-[#2B1612] shadow-lg border border-[#F4ECE1] hover:text-[#008D41] transition-colors">
                <Edit3 size={18} />
              </button>
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black text-[#2B1612] tracking-tight">{user?.name || 'Guest User'}</h1>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#2B1612]/60 uppercase">
                   {user?.role || 'Buyer'}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#2B1612]/60">
                  <Phone size={16} className="text-[#008D41]" /> {user?.phone || 'No phone set'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/edit-profile')}
              className="rounded-xl border-2 border-[#008D41] text-[#008D41] px-6 py-3 font-bold hover:bg-[#008D41] hover:text-white transition-all shadow-sm pb-2 mb-2"
            >
              {t('profile.edit')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="col-span-1 space-y-4">
            <div className="rounded-[32px] bg-gradient-sunset p-8 text-white shadow-lg shadow-[#F7971E]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-pattern-kikoy opacity-15" />
              import React, { useEffect, useState } from 'react';
              import { Edit2, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
              import { useNavigate } from 'react-router-dom';
              import { useAuth } from '../contexts/AuthContext';
              import { userApi, type UserProfile } from '../services/api';
              import { formatDate, trustBadgeForTransactions } from '../utils/marketplace';
              import { notifyError } from '../utils/notify';

              export function Profile() {
                const { user } = useAuth();
                const navigate = useNavigate();
                const [profile, setProfile] = useState<UserProfile | null>(null);

                useEffect(() => {
                  const fetchProfile = async () => {
                    try {
                      const response = await userApi.getCurrentProfile();
                      setProfile(response.user);
                    } catch {
                      notifyError('Could not load profile', 'Tafadhali jaribu tena.');
                    }
                  };

                  fetchProfile();
                }, []);

                const summary = profile || user;
                const trust = trustBadgeForTransactions(profile?.completedTransactions || 0);

                return (
                  <div className="w-full min-h-screen bg-[#FDFBF7] pb-24">
                    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
                      <div className="rounded-[36px] border border-[#F4ECE1] bg-white p-8 shadow-xl shadow-[#008D41]/5 md:p-12">
                        <div className="flex flex-col gap-8 md:flex-row md:items-start">
                          <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-gradient-kenya text-4xl font-black text-white shadow-lg">
                            {summary?.name?.slice(0, 1)?.toUpperCase() || <UserRound size={44} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <h1 className="text-4xl font-black tracking-tight text-[#2B1612]">{summary?.name || 'Your profile'}</h1>
                                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-[#2B1612]/60"><MapPin size={18} className="text-[#E32636]" /> {summary?.county || 'Kenya'}</p>
                              </div>
                              <div className="inline-flex items-center gap-2 rounded-full bg-[#008D41]/10 px-4 py-2 text-sm font-black text-[#008D41]">
                                <ShieldCheck size={16} /> {trust.label}
                              </div>
                            </div>

                            <p className="mt-6 max-w-2xl text-[#2B1612]/80">{summary?.bio || 'Update your bio to tell buyers about your farm, delivery area, and produce quality.'}</p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] p-5"><div className="text-3xl font-black text-[#008D41]">{profile?.averageRating?.toFixed?.(1) || '0.0'}</div><div className="mt-1 text-sm font-medium text-[#2B1612]/60">Average rating</div></div>
                              <div className="rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] p-5"><div className="text-3xl font-black text-[#E32636]">{profile?.reviewCount || 0}</div><div className="mt-1 text-sm font-medium text-[#2B1612]/60">Reviews</div></div>
                              <div className="rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] p-5"><div className="text-3xl font-black text-[#F7971E]">{profile?.completedTransactions || 0}</div><div className="mt-1 text-sm font-medium text-[#2B1612]/60">Transactions</div></div>
                              <div className="rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] p-5"><div className="text-3xl font-black text-[#008D41]">{formatDate(profile?.createdAt || new Date().toISOString())}</div><div className="mt-1 text-sm font-medium text-[#2B1612]/60">Member since</div></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-4">
                          <button onClick={() => navigate('/edit-profile')} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-kenya px-6 py-3 font-black text-white shadow-lg shadow-[#008D41]/20"><Edit2 size={16} /> Edit profile</button>
                          <button onClick={() => navigate('/orders')} className="rounded-2xl border border-[#F4ECE1] bg-white px-6 py-3 font-black text-[#2B1612]">View orders</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
