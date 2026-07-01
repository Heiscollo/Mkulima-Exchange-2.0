import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Package, ShieldAlert, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderApi, paymentApi, type Order } from '../services/api';
import { formatDate, formatKES } from '../utils/marketplace';
import { notifyError, notifySuccess } from '../utils/notify';

export function Orders() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isFarmer, isBuyer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderApi.getOrders();
        setOrders(response.data || []);
      } catch {
        notifyError('Could not load orders', 'Tafadhali jaribu tena.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const mappedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      title: `${order.listing?.cropName || 'Produce'} x ${order.quantity}`,
      image: order.listing?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
      date: formatDate(order.createdAt),
      total: formatKES(order.totalPrice),
    }));
  }, [orders]);

  const filteredOrders = mappedOrders.filter((order) =>
    activeTab === 'active' ? !['COMPLETED', 'REFUNDED', 'REJECTED'].includes(order.status) : ['COMPLETED', 'REFUNDED', 'REJECTED'].includes(order.status)
  );

  const handlePayment = async (orderId: string) => {
    try {
      await paymentApi.initiatePayment(orderId);
      notifySuccess('Payment started', 'Follow the M-Pesa prompt on your phone.');
    } catch (error: any) {
      notifyError('Payment failed', error?.response?.data?.message || 'Unable to initiate payment.');
    }
  };

  return (
    <div className="w-full pb-24">
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-[#2B1612]">Orders</h1>
          <p className="mt-2 text-lg font-medium text-[#2B1612]/60">Negotiation, escrow, and delivery status in one place.</p>

          <div className="mt-8 flex max-w-sm rounded-[20px] bg-[#F4ECE1] p-1.5 shadow-inner">
            <button onClick={() => setActiveTab('active')} className={`flex-1 rounded-[16px] py-3 text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-[#008D41] shadow-sm' : 'text-[#2B1612]/60 hover:text-[#2B1612]'}`}>
              Active
            </button>
            <button onClick={() => setActiveTab('past')} className={`flex-1 rounded-[16px] py-3 text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-white text-[#008D41] shadow-sm' : 'text-[#2B1612]/60 hover:text-[#2B1612]'}`}>
              Past
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="rounded-[32px] bg-white p-10 text-center text-[#2B1612]/60 shadow-sm border border-[#F4ECE1]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-[#F4ECE1] bg-white py-24 text-center shadow-sm">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#F4ECE1]">
                <Package size={40} className="text-[#008D41]/40" />
              </div>
              <h3 className="text-2xl font-black text-[#2B1612]">No orders yet</h3>
              <p className="mt-2 text-[#2B1612]/60 font-medium">Browse listings and start placing orders.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="group overflow-hidden rounded-[32px] border border-[#F4ECE1] bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-[#008D41]/10">
                <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                  <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-[24px]">
                    <img src={order.image} alt={order.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-[#2B1612]/5" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-bold uppercase tracking-wider text-[#E32636]">{order.farmer?.name || 'Farmer'}</p>
                        <span className="rounded-lg bg-[#F4ECE1] px-3 py-1 text-sm font-bold text-[#2B1612]/50">{order.id}</span>
                      </div>
                      <h4 className="mt-3 line-clamp-1 text-2xl font-black text-[#2B1612]">{order.title}</h4>
                      <p className="mt-2 text-xl font-black text-[#008D41]">{order.total}</p>
                      <p className="mt-2 text-sm font-medium text-[#2B1612]/60">Negotiation round: {order.counterRound} of 3</p>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-[#F4ECE1] pt-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${order.status === 'COMPLETED' ? 'bg-[#008D41]/10 text-[#008D41]' : order.status === 'PAID' ? 'bg-[#FFD200]/20 text-[#F7971E]' : 'bg-[#E32636]/10 text-[#E32636]'}`}>
                          {order.status === 'PAID' ? <Truck size={20} /> : order.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Package size={20} />}
                        </div>
                        <div>
                          <span className={`block text-sm font-black uppercase tracking-wider ${order.status === 'COMPLETED' ? 'text-[#008D41]' : order.status === 'PAID' ? 'text-[#F7971E]' : 'text-[#E32636]'}`}>{order.status}</span>
                          <span className="block text-sm font-medium text-[#2B1612]/50 mt-0.5">{order.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {(!['COMPLETED', 'REFUNDED', 'REJECTED'].includes(order.status)) ? (
                          <button onClick={() => navigate(`/negotiate/${order.id}`)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F4ECE1] px-5 py-4 text-sm font-bold text-[#2B1612] transition-colors hover:bg-gradient-kenya hover:text-white">
                            Negotiate <ChevronRight size={18} />
                          </button>
                        ) : null}
                        {isBuyer && order.status === 'ACCEPTED' ? (
                          <button onClick={() => handlePayment(order.id)} className="rounded-2xl bg-gradient-kenya px-5 py-4 text-sm font-black text-white">Pay now</button>
                        ) : null}
                        {order.status === 'COMPLETED' ? (
                          <button onClick={() => navigate(`/review/${order.id}`)} className="rounded-2xl bg-[#008D41]/10 px-5 py-4 text-sm font-black text-[#008D41]">Leave review</button>
                        ) : null}
                        {order.status === 'DISPUTED' ? (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#E32636]/10 px-5 py-4 text-sm font-black text-[#E32636]"><ShieldAlert size={16} /> Under review</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isFarmer || isBuyer ? null : null}
      </div>
    </div>
  );
}

