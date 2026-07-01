import React, { useEffect, useState } from 'react';
import { ShoppingCart, Star, Wallet } from 'lucide-react';
import { orderApi, reviewApi, type Order, type OrderReview } from '../services/api';
import { formatKES } from '../utils/marketplace';
import { notifyError } from '../utils/notify';

export function BuyerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<OrderReview[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [orderResponse, reviewResponse] = await Promise.all([
          orderApi.getOrders(),
          reviewApi.getUserReviews('me').catch(() => null),
        ]);
        setOrders(orderResponse.data || []);
        setReviews(reviewResponse?.data?.reviews || []);
      } catch {
        notifyError('Dashboard load failed', 'Could not load buyer metrics.');
      }
    };

    load();
  }, []);

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#008D41]">Buyer dashboard</p>
        <h1 className="mt-2 text-4xl font-black text-[#2B1612]">Track your sourcing</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><ShoppingCart className="text-[#008D41]" /><div className="mt-4 text-3xl font-black">{orders.length}</div><div className="text-sm text-[#2B1612]/60">Orders placed</div></div>
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><Wallet className="text-[#E32636]" /><div className="mt-4 text-3xl font-black">{formatKES(totalSpent)}</div><div className="text-sm text-[#2B1612]/60">Total spent</div></div>
        <div className="rounded-[28px] border border-[#F4ECE1] bg-white p-6 shadow-sm"><Star className="text-[#F7971E]" /><div className="mt-4 text-3xl font-black">{reviews.length}</div><div className="text-sm text-[#2B1612]/60">Reviews written</div></div>
      </div>
    </div>
  );
}
