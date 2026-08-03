import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, Sun, Moon, Leaf } from 'lucide-react';
import { cn } from './ui/GradientButton';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar } from './ui/Avatar';
import { NotificationBadge } from './NotificationBadge';

export function Navbar() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: t('nav.market'), path: '/search' },
    { name: t('nav.orders'), path: '/orders' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <nav className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex h-20 items-center justify-between rounded-[32px] bg-white/90 dark:bg-[#221917]/90 px-6 sm:px-8 shadow-xl shadow-[#008D41]/5 backdrop-blur-xl border border-white/50 dark:border-white/10 overflow-hidden">
          {/* Subtle pattern background for the navbar */}
          <div className="absolute inset-0 bg-pattern-dots pointer-events-none" />

          <div className="relative z-10 flex items-center gap-8 lg:gap-12">
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-kenya shadow-lg shadow-[#008D41]/30 transition-transform group-hover:scale-105 overflow-hidden">
                <Leaf className="text-white absolute bottom-1 right-1 opacity-20" size={24} />
                <span className="text-2xl font-black text-white tracking-tighter">M</span>
              </div>
              <div className="hidden sm:block">
                <span className="block text-xl font-black tracking-tight text-[#2B1612] dark:text-[#F4ECE1] leading-none">Mkulima</span>
                <span className="block text-xs font-bold text-[#E32636] uppercase tracking-wider mt-0.5">Exchange</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-4 bg-[#F4ECE1]/50 dark:bg-[#2C211D] p-1.5 rounded-2xl">
              <Link
                to="/home"
                className={cn(
                  "px-5 py-2.5 rounded-[12px] text-sm font-bold transition-all",
                  location.pathname === '/home'
                    ? "bg-white dark:bg-[#221917] text-[#008D41] shadow-sm transform scale-105"
                    : "text-[#2B1612]/70 dark:text-[#F4ECE1]/70 hover:bg-white/60 dark:hover:bg-[#221917]/60 hover:text-[#2B1612] dark:hover:text-[#F4ECE1]"
                )}
              >
                {t('nav.home')}
              </Link>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-5 py-2.5 rounded-[12px] text-sm font-bold transition-all",
                    location.pathname === link.path
                      ? "bg-white dark:bg-[#221917] text-[#008D41] shadow-sm transform scale-105"
                      : "text-[#2B1612]/70 dark:text-[#F4ECE1]/70 hover:bg-white/60 dark:hover:bg-[#221917]/60 hover:text-[#2B1612] dark:hover:text-[#F4ECE1]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <Link to="/home?fresh=true" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] dark:bg-[#2C211D] rounded-full text-xs font-bold text-[#F7971E] border border-[#F7971E]/20 hover:bg-[#F7971E]/10 transition-colors">
                <Sun size={14} /> {t('nav.fresh')}
              </Link>
            </div>

            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="cursor-pointer p-2.5 text-[#2B1612]/70 dark:text-[#F4ECE1]/70 hover:text-[#008D41] hover:bg-[#F4ECE1] dark:hover:bg-[#2C211D] rounded-xl transition-all"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleLanguage}
              className="cursor-pointer px-3 py-1.5 text-xs font-black uppercase text-[#008D41] bg-[#008D41]/10 hover:bg-[#008D41]/20 rounded-lg transition-all border border-[#008D41]/20"
            >
              {language === 'en' ? 'SW' : 'EN'}
            </button>

            <Link to="/search" className="p-2.5 text-[#2B1612]/70 dark:text-[#F4ECE1]/70 hover:text-[#008D41] hover:bg-[#F4ECE1] dark:hover:bg-[#2C211D] rounded-xl transition-all">
              <Search size={22} />
            </Link>
            <Link to="/orders" className="relative p-2.5 text-[#2B1612]/70 dark:text-[#F4ECE1]/70 hover:text-[#008D41] hover:bg-[#F4ECE1] dark:hover:bg-[#2C211D] rounded-xl transition-all">
              <ShoppingBag size={22} />
              <NotificationBadge />
            </Link>
            <Link to="/profile" className="flex items-center gap-3 rounded-full border-2 border-[#F4ECE1] dark:border-[#3A2B26] p-1.5 pr-5 ml-2 transition-all hover:border-[#008D41] hover:shadow-md hover:shadow-[#008D41]/10">
              <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
              <span className="text-sm font-bold text-[#2B1612] dark:text-[#F4ECE1] hidden sm:block">{user?.name || 'User'}</span>
            </Link>
            <button className="cursor-pointer md:hidden p-2.5 text-[#2B1612] dark:text-[#F4ECE1] bg-[#F4ECE1] dark:bg-[#2C211D] rounded-xl ml-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
