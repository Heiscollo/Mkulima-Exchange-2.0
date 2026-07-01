import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { formatKES, toLabel } from '../utils/marketplace';
import type { Listing } from '../services/api';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop';

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-[28px] border border-[#F4ECE1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#008D41]/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={listing.cropName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1612]/75 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">{toLabel(listing.cropCategory)}</span>
          <span className="rounded-full bg-[#008D41] px-3 py-1 text-xs font-bold">{listing.status}</span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-black text-[#2B1612]">{listing.cropName}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#2B1612]/60">
            <MapPin size={14} className="text-[#E32636]" /> {toLabel(listing.county)}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2B1612]/45">Price</p>
            <p className="text-xl font-black text-[#008D41]">{formatKES(listing.pricePerUnit)}/{listing.unit}</p>
          </div>
          <div className="text-right text-sm font-medium text-[#2B1612]/60">
            <p>{listing.quantity} {listing.unit}</p>
            <p>By {listing.farmer?.name || 'Farmer'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
