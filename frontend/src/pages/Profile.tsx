import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Edit3, Heart, LogOut, MapPin, Package, Phone, Settings, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const menuItems = useMemo(
    () => [
      { icon: Package, label: t('profile.orders'), path: '/orders', color: 'text-[#008D41]', bg: 'bg-[#008D41]/10' },
      { icon: Heart, label: t('profile.saved'), path: '/saved', color: 'text-[#E32636]', bg: 'bg-[#E32636]/10' },
      { icon: MapPin, label: t('profile.addresses'), path: '/addresses', color: 'text-[#F7971E]', bg: 'bg-[#F7971E]/10' },
      { icon: ShieldCheck, label: t('profile.payments'), path: '/payments', color: 'text-[#008D41]', bg: 'bg-[#008D41]/10' },
      { icon: Settings, label: t('profile.settings'), path: '/settings', color: 'text-[#2B1612]', bg: 'bg-[#2B1612]/10' },
    ],
    [t]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-[40px] border border-[#F4ECE1] bg-white p-6 shadow-xl shadow-[#008D41]/5 sm:p-10">
          <div className="absolute left-0 right-0 top-0 h-48 bg-gradient-kenya">
            <div className="absolute inset-0 bg-pattern-kikoy opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
              alt="Profile cover"
              className="h-full w-full object-cover opacity-60 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 mt-24 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:gap-8 sm:text-left">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl">
                <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
              </div>
              <button
                type="button"
                onClick={() => navigate('/edit-profile')}
                className="absolute -bottom-2 -right-2 rounded-xl border border-[#F4ECE1] bg-white p-2.5 text-[#2B1612] shadow-lg transition-colors hover:text-[#008D41]"
                aria-label={t('profile.edit')}
              >
                <Edit3 size={18} />
              </button>
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black tracking-tight text-[#2B1612]">
                {user?.name || 'Guest User'}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center gap-4 sm:justify-start">
                <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-[#2B1612]/60">
                  {user?.role || 'Buyer'}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#2B1612]/60">
                  <Phone size={16} className="text-[#008D41]" />
                  {user?.phone || 'No phone set'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/edit-profile')}
              className="mb-2 rounded-xl border-2 border-[#008D41] px-6 py-3 font-bold text-[#008D41] shadow-sm transition-all hover:bg-[#008D41] hover:text-white"
            >
              {t('profile.edit')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 space-y-4">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-sunset p-8 text-white shadow-lg shadow-[#F7971E]/20">
              <div className="absolute inset-0 bg-pattern-kikoy opacity-15" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
                  Profile snapshot
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-3xl font-black">{user?.name || 'Guest User'}</div>
                    <div className="mt-1 flex items-center gap-2 text-sm font-medium text-white/80">
                      <MapPin size={16} />
                      {user?.county || 'Kenya'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                        Role
                      </div>
                      <div className="mt-1 text-lg font-black">{user?.role || 'Buyer'}</div>
                    </div>
                    <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                        Contact
                      </div>
                      <div className="mt-1 text-lg font-black">{user?.phone || 'No phone set'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-[#F4ECE1] bg-white px-5 py-4 font-black text-[#E32636] shadow-sm transition-colors hover:bg-[#E32636]/5"
            >
              <LogOut size={18} />
              {t('profile.logout')}
            </button>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black tracking-tight text-[#2B1612]">Account</h2>
              <div className="mt-6 space-y-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center justify-between rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] px-4 py-4 transition-all hover:border-[#008D41]/20 hover:bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                          <Icon size={20} className={item.color} />
                        </div>
                        <div>
                          <div className="font-bold text-[#2B1612]">{item.label}</div>
                          <div className="text-sm text-[#2B1612]/55">Open this section</div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#2B1612]/35" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
