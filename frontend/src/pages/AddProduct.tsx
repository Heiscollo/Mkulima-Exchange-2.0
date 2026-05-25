import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Package, X, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

export function AddProduct() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [image, setImage] = useState(''); // using text url for now instead of file upload to keep it simple
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // To use file upload effectively we would use FormData, but we will mock the image or let user paste URL.
    // The backend accept array of images strings. Wait, backend wants file buffer. We'll use FormData.

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('unit', unit);
      formData.append('quantityAvailable', quantityAvailable);
      formData.append('category', category);

      // In real scenario, we would append files here
      // if (imageFile) formData.append('images', imageFile);

      await axios.post('/api/products', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24 min-h-screen bg-[#FDFBF7]"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#2B1612] tracking-tight">Add Product</h1>
            <p className="mt-2 text-[#2B1612]/60 font-medium text-lg">List a new item from your farm</p>
          </div>
          <button 
            onClick={() => navigate('/home')}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#F4ECE1] text-[#2B1612] hover:text-[#E32636] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <GlassCard variant="light" className="bg-white shadow-xl shadow-[#008D41]/5 border-[#F4ECE1] p-8 rounded-[32px]">
          <form onSubmit={handleSubmit} className="space-y-6 text-[#2B1612]">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold mb-2 ml-2">Product Name</label>
              <Input 
                type="text" 
                placeholder="e.g. Fresh Tomatoes" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#FDFBF7] border-[#F4ECE1]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-2">Description</label>
               <textarea 
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full rounded-[24px] bg-[#FDFBF7] p-5 text-base font-medium outline-none shadow-sm transition-all focus:ring-4 focus:ring-[#FFD200]/50 placeholder:text-[#2B1612]/40 border border-[#F4ECE1]"
               ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold mb-2 ml-2">Price (KSh)</label>
                  <Input 
                     type="number" 
                     placeholder="e.g. 150" 
                     required
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     className="bg-[#FDFBF7] border-[#F4ECE1]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 ml-2">Unit</label>
                  <select 
                     value={unit}
                     onChange={(e) => setUnit(e.target.value)}
                     className="w-full rounded-[24px] bg-[#FDFBF7] h-[64px] px-5 text-base font-medium outline-none shadow-sm border border-[#F4ECE1]"
                  >
                     <option value="kg">Per kg</option>
                     <option value="piece">Per piece</option>
                     <option value="bunch">Per bunch</option>
                     <option value="bag">Per bag</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold mb-2 ml-2">Category</label>
                 <select 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full rounded-[24px] bg-[#FDFBF7] h-[64px] px-5 text-base font-medium outline-none shadow-sm border border-[#F4ECE1]"
                  >
                     <option value="Vegetables">Vegetables</option>
                     <option value="Fruits">Fruits</option>
                     <option value="Grains">Grains</option>
                     <option value="Dairy">Dairy</option>
                     <option value="Poultry">Poultry</option>
                     <option value="Tubers">Tubers</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 ml-2">Stock Available</label>
                  <Input 
                     type="number" 
                     placeholder="e.g. 100" 
                     required
                     value={quantityAvailable}
                     onChange={(e) => setQuantityAvailable(e.target.value)}
                     className="bg-[#FDFBF7] border-[#F4ECE1]"
                  />
               </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 py-4 mt-4 rounded-[16px] bg-gradient-kenya text-white font-bold text-lg shadow-lg shadow-[#008D41]/30 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? 'Adding Product...' : 'Add Product'} {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
}
