import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Filter, MapPin, ChevronRight, Star } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const { t } = useLanguage();
  const { user } = useAuth(); // If we want to hide floating action if not farmer
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: t('cat.all'), icon: '🌾' },
    { id: 'vegetables', label: t('cat.veg'), icon: '🥬' },
    { id: 'fruits', label: t('cat.fruits'), icon: '🍎' },
    { id: 'grains', label: t('cat.grains'), icon: '🌽' },
    { id: 'tubers', label: t('cat.tubers'), icon: '🥔' },
    { id: 'dairy', label: t('cat.dairy'), icon: '🥛' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = activeCategory === 'all' ? '/api/products' : `/api/products?category=${activeCategory}`;
        const { data } = await axios.get(url);
        // data contains { products, page, pages }
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner */}
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-[40px]" />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[40px] bg-gradient-kenya p-8 md:p-14 text-white shadow-2xl shadow-[#008D41]/20"
          >
            {/* Kikoy Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern-kikoy" />
            
            <div className="relative z-10 w-full md:w-3/5 lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#FFD200] animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider text-white">{t('home.bannerLabel')}</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t('home.bannerTitle').replace('\n', '<br/>') }} />

              <p className="mt-6 text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-md">
                {t('home.bannerSubtitle')}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="rounded-full bg-white px-8 py-4 text-base font-black text-[#008D41] shadow-xl shadow-black/10 transition-transform hover:scale-105 flex items-center gap-2">
                  {t('home.shopNow')} <ChevronRight size={20} />
                </button>
                <button className="rounded-full bg-black/20 backdrop-blur-md px-8 py-4 text-base font-bold text-white border border-white/20 transition-all hover:bg-black/30">
                  {t('home.viewOffers')}
                </button>
              </div>
            </div>
            
            {/* Right side Images Composite */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
              {/* Decorative shapes behind */}
              <div className="absolute top-[-10%] right-[10%] w-[120%] h-[120%] rounded-full bg-[#FFD200]/20 blur-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" 
                alt="Kenyan Market Produce" 
                className="absolute -right-10 top-1/2 -translate-y-1/2 h-[120%] w-[120%] max-w-none object-cover opacity-90 drop-shadow-2xl mix-blend-overlay rotate-[15deg]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}

        {/* Categories Section - Rich styling */}
        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-3xl font-black text-[#2B1612] tracking-tight">{t('home.categories')}</h3>
              <p className="text-[#2B1612]/60 font-medium mt-1">{t('home.categoriesDesc')}</p>
            </div>
            <button className="text-sm font-bold text-[#E32636] hover:text-[#008D41] transition-colors flex items-center gap-1 group">
              {t('home.seeAll')} <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center justify-center min-w-[110px] md:min-w-[130px] rounded-[24px] p-5 transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'bg-gradient-sunset text-white shadow-lg shadow-[#F7971E]/40 scale-105 border border-white/20' 
                    : 'bg-white text-[#2B1612] shadow-sm hover:shadow-md hover:-translate-y-1 border border-[#F4ECE1]'
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-3 ${
                  activeCategory === category.id ? 'bg-white/20' : 'bg-[#FDFBF7]'
                }`}>
                  <span className="text-3xl filter drop-shadow-sm">{category.icon}</span>
                </div>
                <span className="text-[13px] font-bold text-center leading-tight">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Near You */}
        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-3xl font-black text-[#2B1612] tracking-tight">{t('home.popular')}</h3>
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={16} className="text-[#E32636]" />
                <p className="text-[#2B1612]/60 font-medium">{t('home.popularDesc')}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[32px] bg-white p-3 shadow-sm border border-[#F4ECE1]">
                  <Skeleton className="aspect-square w-full rounded-[24px]" />
                  <div className="mt-4 space-y-3 p-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="mt-4 h-6 w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (for farmers) */}
      {user?.role === 'farmer' && (
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/add-product')}
          className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-kenya text-white shadow-xl shadow-[#008D41]/40 border border-white/20"
        >
          <Plus size={32} />
        </motion.button>
      )}
    </motion.div>
  );
}

