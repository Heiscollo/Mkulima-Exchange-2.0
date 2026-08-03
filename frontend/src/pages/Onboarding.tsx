import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { GradientButton } from '../components/ui/GradientButton';
import { useLanguage } from '../contexts/LanguageContext';

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const slides = useMemo(() => [
    {
      id: 1,
      title: t('onboarding.title1'),
      subtitle: t('onboarding.subtitle1'),
      image: "https://images.unsplash.com/photo-1595856364585-802c6130b0bf?q=80&w=1920&auto=format&fit=crop"
    },
    {
      id: 2,
      title: t('onboarding.title2'),
      subtitle: t('onboarding.subtitle2'),
      image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1920&auto=format&fit=crop"
    },
    {
      id: 3,
      title: t('onboarding.title3'),
      subtitle: t('onboarding.subtitle3'),
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop"
    }
  ], [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#2B1612] overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 z-10 bg-pattern-kikoy opacity-10 pointer-events-none" />

      {/* Navbar overlay for Landing */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-kenya shadow-lg shadow-[#008D41]/30 overflow-hidden">
            <Leaf className="text-white absolute bottom-1 right-1 opacity-20" size={24} />
            <span className="text-2xl font-black text-white tracking-tighter">M</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">Mkulima Exchange</span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleLanguage}
            className="cursor-pointer px-3 py-1.5 text-xs font-black uppercase text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
          >
            {language === 'en' ? 'SW' : 'EN'}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer rounded-[16px] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 border border-white/30 backdrop-blur-md"
          >
            {t('onboarding.login')}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#2B1612] via-[#2B1612]/60 to-transparent" />

      <div className="relative z-20 flex flex-1 flex-col justify-center px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <h1 className="mb-6 text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-white tracking-tighter drop-shadow-2xl">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl drop-shadow-md">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/register')}
            className="cursor-pointer rounded-[20px] bg-gradient-kenya px-10 py-5 text-lg font-black text-white shadow-xl shadow-[#008D41]/30 transition-transform hover:scale-105 w-full sm:w-auto text-center"
          >
            {t('onboarding.getStarted')}
          </button>
          <button
            onClick={() => navigate('/home')}
            className="cursor-pointer rounded-[20px] border border-white/40 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white w-full sm:w-auto text-center"
          >
            {t('onboarding.explore')}
          </button>
        </div>

        <div className="absolute bottom-12 left-6 md:left-12 lg:left-24 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 cursor-pointer rounded-full transition-all duration-500 ease-out ${
                index === currentSlide ? "w-16 bg-[#FFD200] shadow-[0_0_10px_rgba(255,210,0,0.5)]" : "w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
