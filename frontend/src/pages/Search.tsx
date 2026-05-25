import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, Filter, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import axios from 'axios';
import { useDebounce } from '../hooks/useDebounce'; // We will create this

export function Search() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      axios.get(`/api/products?keyword=${debouncedSearchTerm}`)
        .then(res => setSearchResults(res.data.products || []))
        .catch(err => console.error(err))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const searchCategories = useMemo(() => [
    {
      id: '1',
      title: t('scat.fruits'),
      subtitle: t('scat.fruits.sub'),
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop',
      items: `120+ ${t('scat.items')}`
    },
    {
      id: '2',
      title: t('scat.veg'),
      subtitle: t('scat.veg.sub'),
      image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=600&auto=format&fit=crop',
      items: `85+ ${t('scat.items')}`
    },
    {
      id: '3',
      title: t('scat.grains'),
      subtitle: t('scat.grains.sub'),
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
      items: `200+ ${t('scat.items')}`
    },
    {
      id: '4',
      title: t('scat.tubers'),
      subtitle: t('scat.tubers.sub'),
      image: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?q=80&w=600&auto=format&fit=crop',
      items: `40+ ${t('scat.items')}`
    },
    {
      id: '5',
      title: t('scat.dairy'),
      subtitle: t('scat.dairy.sub'),
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
      items: `30+ ${t('scat.items')}`
    },
    {
      id: '6',
      title: t('scat.poultry'),
      subtitle: t('scat.poultry.sub'),
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600&auto=format&fit=crop',
      items: `50+ ${t('scat.items')}`
    }
  ], [t]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header with Pattern Background */}
        <div className="relative w-full overflow-hidden rounded-[40px] shadow-xl shadow-[#E32636]/10 bg-[#E32636]">
          <div className="absolute inset-0 bg-pattern-kikoy opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E32636] to-[#008D41] mix-blend-multiply opacity-80" />
          
          <div className="relative z-10 mx-auto flex flex-col justify-center px-8 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">{t('search.hero')}</h1>
            <p className="mt-4 text-lg text-white/90 font-medium">{t('search.heroDesc')}</p>
            
            <div className="mt-10 mx-auto w-full max-w-2xl flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2B1612]/40" size={24} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search.placeholder')} 
                  className="w-full rounded-[20px] bg-white py-5 pl-16 pr-6 text-lg font-medium text-[#2B1612] outline-none shadow-2xl transition-all focus:ring-4 focus:ring-[#FFD200]/50 placeholder:text-[#2B1612]/40"
                />
              </div>
              <button className="flex h-[68px] items-center justify-center gap-2 rounded-[20px] bg-gradient-kenya px-8 text-white font-bold shadow-lg transition-transform hover:scale-105 sm:w-auto w-full">
                <Filter size={24} /> <span className="sm:hidden">{t('search.filter')}</span>
              </button>
            </div>
          </div>
        </div>

        {searchTerm ? (
          <div className="pt-16">
            <h3 className="text-3xl font-black text-[#2B1612] tracking-tight mb-8">Search Results</h3>
            {isSearching ? (
              <div className="text-center text-[#2B1612]/60 font-bold">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {searchResults.map((product) => (
                   <ProductCard key={product._id} {...product} />
                ))}
              </div>
            ) : (
                <div className="text-center text-[#2B1612]/60 font-bold">No products found for "{searchTerm}"</div>
            )}
          </div>
        ) : (
          <div className="pt-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h3 className="text-3xl font-black text-[#2B1612] tracking-tight">{t('search.browse')}</h3>
                <p className="text-[#2B1612]/60 font-medium mt-1">{t('search.browseDesc')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {searchCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative h-72 w-full overflow-hidden rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-[#008D41]/20 cursor-pointer border border-[#F4ECE1]"
                >
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B1612] via-[#2B1612]/40 to-transparent opacity-80" />
                  
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end h-full">
                    <div className="bg-[#E32636] w-12 h-1 mb-4 rounded-full transform origin-left transition-all group-hover:w-20 group-hover:bg-[#FFD200]" />
                    <p className="text-sm font-bold text-[#FFD200] uppercase tracking-wider mb-1">{category.subtitle}</p>
                    <h4 className="text-3xl font-black text-white leading-tight">{category.title}</h4>
                    
                    <div className="mt-4 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-bold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                        {category.items}
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#008D41] transform translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

