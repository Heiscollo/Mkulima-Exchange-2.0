import React from 'react';
import { motion } from 'motion/react';
import { Heart, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductCardProps {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  price: string | number;
  farmer?: string;
  farmerId?: { name: string };
  image?: string;
  images?: string[];
  rating?: number;
  unit?: string;
}

export function ProductCard({ id, _id, title, name, price, farmer, farmerId, image, images, rating = 4.5, unit = 'unit' }: ProductCardProps) {
  const { t } = useLanguage();

  const displayTitle = title || name || 'Unnamed Product';
  const displayPrice = typeof price === 'number' ? `KSh ${price}/${unit}` : price;
  const displayFarmer = farmer || (farmerId ? farmerId.name : 'Unknown Farmer');
  const displayImage = image || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop');

  return (
    <div
      className="group relative flex flex-col h-full overflow-hidden rounded-[32px] bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-[#008D41]/10 border border-[#F4ECE1]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[32px]">
        <img 
          src={displayImage} 
          alt={displayTitle} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1612]/80 via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center rounded-xl bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-[#2B1612] shadow-sm">
              <span className="text-[#F7971E] mr-1">★</span> {rating}
            </span>
          </div>
          <button className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md transition-colors hover:bg-[#E32636] hover:text-white border border-white/30 text-white shadow-sm">
            <Heart size={18} />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-medium text-white/90 drop-shadow-md">{t('home.by')} {displayFarmer}</p>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-5 pt-4 bg-white relative z-10">
        <h3 className="font-bold text-[#2B1612] line-clamp-2 leading-tight text-lg mb-1">{displayTitle}</h3>
        
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#2B1612]/50 uppercase tracking-wider">{t('home.price')}</span>
            <span className="text-xl font-black text-[#008D41] tracking-tight">{displayPrice}</span>
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F4ECE1] text-[#2B1612] transition-colors hover:bg-gradient-kenya hover:text-white shadow-sm">
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

