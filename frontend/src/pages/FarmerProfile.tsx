import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Sprout, Star, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import { listingApi, reviewApi, type Listing, type PublicUserProfile } from '../services/api';
import { toLabel } from '../utils/marketplace';
import { notifyError } from '../utils/notify';

export function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [profileResponse, listingsResponse] = await Promise.all([
          reviewApi.getUserProfile(id),
          listingApi.getListings({ farmer_id: id }),
        ]);
        setProfile(profileResponse.data);
        setListings(listingsResponse.listings || []);
      } catch {
        notifyError('Could not load profile', 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-[#008D41] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-[#008D41] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-[#008D41] rounded-full animate-bounce"></div>
          <span className="text-sm font-medium text-[#008D41] ml-1">Loading profile...</span>
        </div>

        <div className="rounded-[40px] border border-[#F4ECE1] bg-white p-6 shadow-xl shadow-[#008D41]/5 sm:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="h-28 w-28 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="mx-auto h-7 w-48 animate-pulse rounded bg-gray-200 sm:mx-0" />
              <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200 sm:mx-0" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="h-20 animate-pulse rounded-[24px] bg-gray-200" />
            <div className="h-20 animate-pulse rounded-[24px] bg-gray-200" />
            <div className="col-span-2 h-20 animate-pulse rounded-[24px] bg-gray-200 sm:col-span-1" />
          </div>
        </div>

        <div className="mt-10">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 h-64 w-full animate-pulse rounded-[28px] bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-[#2B1612]/60">Profile not found.</div>;
  }

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cropsGrown = profile.farmerProfile?.cropsGrown || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex cursor-pointer items-center gap-2 font-bold text-[#2B1612] hover:text-[#008D41]">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="rounded-[40px] border border-[#F4ECE1] bg-white p-6 shadow-xl shadow-[#008D41]/5 sm:p-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#008D41] shadow-xl">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-3xl font-black text-white">{initials}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-3xl font-black tracking-tight text-[#2B1612]">{profile.name}</h1>
              <span className="rounded-full bg-[#008D41]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#008D41]">{profile.trustBadge}</span>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-bold text-[#2B1612]/60 sm:justify-start">
              <MapPin size={16} className="text-[#E32636]" /> {profile.county ? toLabel(profile.county) : 'Kenya'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-[#FDFBF7] p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#F7971E]">
              <Star size={18} fill="currentColor" />
              <span className="text-2xl font-black text-[#2B1612]">{profile.averageRating.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2B1612]/50">Average rating</p>
          </div>
          <div className="rounded-[24px] bg-[#FDFBF7] p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#008D41]">
              <TrendingUp size={18} />
              <span className="text-2xl font-black text-[#2B1612]">{profile.completedTransactions}</span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2B1612]/50">Completed orders</p>
          </div>
          <div className="col-span-2 rounded-[24px] bg-[#FDFBF7] p-5 sm:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-[#2B1612] sm:justify-start">
              <Sprout size={18} className="text-[#008D41]" />
              <p className="text-xs font-bold uppercase tracking-wide text-[#2B1612]/50">Crops grown</p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {cropsGrown.length > 0
                ? cropsGrown.map((crop) => (
                    <span key={crop} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#2B1612]">{crop}</span>
                  ))
                : <span className="text-sm text-[#2B1612]/50">Not listed</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-black text-[#2B1612]">Active listings</h2>
        <p className="text-sm text-[#2B1612]/60">{listings.length} available right now</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {listings.length > 0
            ? listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            : (
              <div className="col-span-full rounded-[28px] border border-dashed border-[#F4ECE1] bg-white p-10 text-center text-[#2B1612]/60">
                No active listings right now.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
