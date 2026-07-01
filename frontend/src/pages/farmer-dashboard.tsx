import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ShieldCheck, TrendingUp } from 'lucide-react';
import { listingApi, orderApi, type Listing, type Order } from '../services/api';
import { formatKES } from '../utils/marketplace';
import { notifyError } from '../utils/notify';

export function FarmerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [listingResponse, orderResponse] = await Promise.all([
          listingApi.getListings({ limit: 6 }),
          orderApi.getOrders(),
        ]);
        setListings(listingResponse.listings || []);
        setOrders(orderResponse.data || []);
      } catch {
        notifyError('Dashboard load failed', 'Could not load farmer metrics.');
      }
    };

    load();
  }, []);

  const activeOrders = orders.filter((order) => !['COMPLETED', 'REFUNDED', 'REJECTED'].includes(order.status)).length;
  const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#008D41]">Farmer dashboard</p>
        <h1 className="mt-2 text-4xl font-black text-[#2B1612]">Your farm performance</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><TrendingUp className="text-[#008D41]" /><div className="mt-4 text-3xl font-black">{formatKES(revenue)}</div><div className="text-sm text-[#2B1612]/60">Estimated value</div></div>
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><Package className="text-[#E32636]" /><div className="mt-4 text-3xl font-black">{listings.length}</div><div className="text-sm text-[#2B1612]/60">Active listings</div></div>
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><ShieldCheck className="text-[#F7971E]" /><div className="mt-4 text-3xl font-black">{activeOrders}</div><div className="text-sm text-[#2B1612]/60">Orders in progress</div></div>
      </div>
      <div className="mt-8 rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-black text-[#2B1612]"><BarChart3 size={20} /> Recent listings</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-[24px] bg-[#FDFBF7] p-4">
              <div className="font-black text-[#2B1612]">{listing.cropName}</div>
              <div className="text-sm text-[#2B1612]/60">{listing.county}</div>
              <div className="mt-2 font-bold text-[#008D41]">{formatKES(listing.pricePerUnit)} / {listing.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
