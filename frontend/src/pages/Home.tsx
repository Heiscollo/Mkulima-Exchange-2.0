import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CountySelect } from '../components/CountySelect';
import { CropCategorySelect } from '../components/CropCategorySelect';
import { ListingCard } from '../components/ListingCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { listingApi, type Listing } from '../services/api';
import { notifyError } from '../utils/notify';

export function Home() {
  const { isFarmer } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [county, setCounty] = useState('');
  const [cropCategory, setCropCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await listingApi.getListings({
          county: county as any,
          crop_category: cropCategory as any,
          crop_name: search || undefined,
        });
        setListings(response.listings || []);
      } catch {
        notifyError('Failed to load listings', 'Tafadhali jaribu tena baadae.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [county, cropCategory, search]);

  return (
    <div className="w-full pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] bg-gradient-kenya p-6 text-white shadow-2xl shadow-[#008D41]/20 md:p-10">
          <div className="absolute inset-0 bg-pattern-kikoy opacity-20" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em]">Soko la Kenya</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight md:text-6xl">Shamba to Soko, faster and safer.</h1>
              <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">Chuja mazao kwa kaunti, category, na bei. Prices are in KES and listings come directly from farmers.</p>
            </div>
            <div className="grid gap-3 rounded-[28px] bg-white/10 p-4 backdrop-blur-md md:grid-cols-2">
              <CountySelect value={county} onChange={(e) => setCounty(e.target.value)} className="bg-white text-[#2B1612]" label="County filter" />
              <CropCategorySelect value={cropCategory} onChange={(e) => setCropCategory(e.target.value)} className="bg-white text-[#2B1612]" label="Category filter" />
              <label className="block md:col-span-2">
                <span className="mb-2 ml-1 block text-sm font-bold">Search crop</span>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[#2B1612]">
                  <Search size={18} className="text-[#008D41]" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. tomatoes, maize" className="w-full bg-transparent outline-none" />
                </div>
              </label>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#2B1612]">Fresh listings</h2>
            <p className="text-sm text-[#2B1612]/60">{listings.length} active opportunities nearby</p>
          </div>
          {isFarmer ? (
            <button onClick={() => navigate('/add-product')} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#008D41]/30">
              <Plus size={18} /> Add listing
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-[28px] border border-[#F4ECE1] bg-white p-3">
                  <Skeleton className="aspect-[4/3] rounded-[24px]" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))
            : listings.length > 0
              ? listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
              : (
                <div className="col-span-full rounded-[28px] border border-dashed border-[#F4ECE1] bg-white p-10 text-center text-[#2B1612]/60">
                  No listings found. Try a different county or crop category.
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

