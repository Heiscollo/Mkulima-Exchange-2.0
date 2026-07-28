import React, { useState } from 'react';
import { ArrowRight, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { CountySelect } from '../components/CountySelect';
import { CropCategorySelect } from '../components/CropCategorySelect';
import { useAuth } from '../contexts/AuthContext';
import { listingApi } from '../services/api';
import { formatKES } from '../utils/marketplace';
import { notifyError, notifySuccess } from '../utils/notify';

export function AddProduct() {
  const navigate = useNavigate();
  const { isFarmer } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('KG');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isFarmer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-black text-[#2B1612]">Farmers only</h1>
          <p className="mt-3 text-[#2B1612]/60">Creating listings is reserved for farmer accounts.</p>
          <button onClick={() => navigate('/home')} className="mt-6 rounded-2xl bg-gradient-kenya px-6 py-3 font-black text-white">Go home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await listingApi.createListing({
        crop_name: name,
        crop_category: category as any,
        quantity: Number(quantityAvailable),
        unit,
        price_per_unit: Number(price),
        county: county as any,
        available_date: availableDate,
        minimum_order_quantity: minimumOrderQuantity ? Number(minimumOrderQuantity) : undefined,
        description,
        images,
      });
      notifySuccess('Listing created', `${name} imeongezwa kwa ${formatKES(price)}/unit.`);
      navigate('/home');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to add listing';
      setError(message);
      notifyError('Could not create listing', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#2B1612]">Add listing</h1>
            <p className="mt-2 text-[#2B1612]/60">Upload photos, set price, and publish directly to farmers' market.</p>
          </div>
          <button onClick={() => navigate('/home')} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F4ECE1] bg-white text-[#2B1612]">
            <X size={24} />
          </button>
        </div>

        <GlassCard variant="light" className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Crop name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tomatoes" required className="bg-[#FDFBF7]" />
            </div>
            <CropCategorySelect value={category} onChange={(e) => setCategory(e.target.value)} />
            <CountySelect value={county} onChange={(e) => setCounty(e.target.value)} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Quantity</label>
                <Input type="number" min="0.01" step="0.01" value={quantityAvailable} onChange={(e) => setQuantityAvailable(e.target.value)} placeholder="100" required className="bg-[#FDFBF7]" />
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Price per unit (KES)</label>
                <Input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50" required className="bg-[#FDFBF7]" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-[#F4ECE1] bg-[#FDFBF7] px-4 text-base font-medium text-[#2B1612] outline-none">
                  <option value="KG">KG</option>
                  <option value="BAG">Bag</option>
                  <option value="CRATE">Crate</option>
                  <option value="TONNE">Tonne</option>
                  <option value="LITRE">Litre</option>
                  <option value="BUNCH">Bunch</option>
                  <option value="SACK">Sack</option>
                </select>
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Available date</label>
                <Input type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} required className="bg-[#FDFBF7]" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Minimum order quantity</label>
                <Input type="number" min="0.01" step="0.01" value={minimumOrderQuantity} onChange={(e) => setMinimumOrderQuantity(e.target.value)} placeholder="Optional" className="bg-[#FDFBF7]" />
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Photos</label>
                <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#F4ECE1] bg-[#FDFBF7] text-sm font-bold text-[#2B1612]/70">
                  <Upload size={18} /> Choose files
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files || []))} />
                </label>
              </div>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-[24px] border-2 border-[#F4ECE1] bg-[#FDFBF7] p-4 outline-none" placeholder="Describe freshness, quality, farming method, delivery info..." />
            </div>
            <button disabled={isLoading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-4 text-lg font-black text-white shadow-lg shadow-[#008D41]/30 disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? 'Publishing...' : 'Publish listing'} {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
