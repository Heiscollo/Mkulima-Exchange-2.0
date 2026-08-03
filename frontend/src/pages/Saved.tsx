import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface SavedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
}

export function Saved() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [saved, setSaved] = useState<SavedItem[]>([
    {
      id: '1',
      name: 'Fresh Tomatoes - 10kg',
      price: 500,
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=300&auto=format&fit=crop',
      seller: 'Kamau Farms',
    },
    {
      id: '2',
      name: 'Organic Lettuce - Bundle',
      price: 200,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop',
      seller: 'Green Valley',
    },
  ]);

  const handleRemove = (id: string) => {
    setSaved(saved.filter(item => item.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="cursor-pointer p-2.5 hover:bg-[#F4ECE1] rounded-xl transition-colors text-[#2B1612]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-[#2B1612]">{t('profile.saved')}</h1>
        </div>

        {/* Saved Items */}
        {saved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {saved.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] bg-white shadow-sm border border-[#F4ECE1] overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative h-48 overflow-hidden bg-[#F4ECE1]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 cursor-pointer p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#2B1612] line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-[#2B1612]/60 mb-3">{item.seller}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#008D41]">KSh {item.price}</span>
                    <button className="cursor-pointer px-4 py-2 bg-gradient-kenya text-white rounded-lg font-bold hover:scale-105 transition-transform">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto mb-4 text-[#2B1612]/20" />
            <p className="text-lg font-bold text-[#2B1612]/60">No saved items yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
