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
              <div className="relative z-10">
                <p className="text-sm font-bold tracking-wider uppercase text-white/80">{t('profile.completedOrders')}</p>
                <h3 className="mt-1 text-4xl font-black tracking-tighter">42</h3>
                <p className="mt-4 text-sm font-medium text-white/90">{t('profile.completedDesc')}</p>
              </div>
            </div>
            <div className="rounded-[32px] bg-white border border-[#F4ECE1] p-8 text-[#2B1612] shadow-sm">
              <p className="text-sm font-bold tracking-wider uppercase text-[#2B1612]/50">{t('profile.wallet')}</p>
              <h3 className="mt-1 text-4xl font-black tracking-tighter text-[#008D41]">KSh 0</h3>
              <button className="mt-4 w-full rounded-xl bg-[#F4ECE1] py-3 text-sm font-bold hover:bg-[#008D41] hover:text-white transition-all">
                {t('profile.topUp')}
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="col-span-1 md:col-span-2">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-sm border border-[#F4ECE1]">
              <div className="divide-y divide-[#F4ECE1]">
                {menuItems.map((item, index) => (
                  <Link 
                    key={index}
                    to={item.path} 
                    className="flex items-center justify-between p-6 hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={24} />
                      </div>
                      <span className="text-lg font-bold text-[#2B1612] group-hover:text-[#008D41] transition-colors">{item.label}</span>
                    </div>
                    <ChevronRight size={20} className="text-[#2B1612]/30 group-hover:text-[#008D41] group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-6 hover:bg-red-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 group-hover:scale-110 transition-transform">
                      <LogOut size={24} />
                    </div>
                    <span className="text-lg font-bold text-red-600">{t('profile.logout')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
