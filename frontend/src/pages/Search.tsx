import React, { useEffect, useState } from 'react';
import { Filter, Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { CountySelect } from '../components/CountySelect';
import { CropCategorySelect } from '../components/CropCategorySelect';
import { ListingCard } from '../components/ListingCard';
import { Skeleton } from '../components/ui/Skeleton';
import { listingApi, type Listing } from '../services/api';
import { notifyError } from '../utils/notify';

export function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [county, setCounty] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm && !county && !category) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await listingApi.getListings({
          crop_name: debouncedSearchTerm || undefined,
          county: county as any,
          crop_category: category as any,
        });
        setSearchResults(response.listings || []);
      } catch {
        notifyError('Search failed', 'Unable to load listings right now.');
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm, county, category]);

  return (
    <div className="w-full pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-[36px] bg-gradient-to-br from-[#E32636] to-[#008D41] p-6 text-white shadow-xl shadow-[#E32636]/10 md:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em]">Find produce</p>
            <h1 className="mt-4 text-4xl font-black md:text-6xl">Search mazao kwa haraka</h1>
            <p className="mt-3 text-white/85">Tafuta kupitia jina la crop, kaunti, au category. Matokeo yote yanaonyeshwa kwa KES.</p>
          </div>
          <div className="mt-6 grid gap-3 rounded-[28px] bg-white/10 p-4 backdrop-blur-md md:grid-cols-3">
            <label className="md:col-span-3 block">
              <span className="mb-2 ml-1 block text-sm font-bold">Search term</span>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[#2B1612]">
                <SearchIcon size={18} className="text-[#008D41]" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g. avocado" className="w-full bg-transparent outline-none" />
              </div>
            </label>
            <CountySelect value={county} onChange={(e) => setCounty(e.target.value)} className="bg-white text-[#2B1612]" label="County" />
            <CropCategorySelect value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white text-[#2B1612]" label="Category" />
            <button type="button" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-[#008D41]">
              <Filter size={18} /> Filtered results
            </button>
          </div>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {isSearching
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
            : searchResults.length > 0
              ? searchResults.map((listing) => <ListingCard key={listing.id} listing={listing} />)
              : (
                <div className="col-span-full rounded-[28px] border border-dashed border-[#F4ECE1] bg-white p-10 text-center text-[#2B1612]/60">
                  Start searching to see produce from across Kenya.
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

