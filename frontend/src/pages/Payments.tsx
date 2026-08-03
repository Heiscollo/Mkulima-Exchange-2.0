import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { orderApi, paymentApi, type Order } from '../services/api';
import { formatKES } from '../utils/marketplace';
import { notifyError, notifySuccess } from '../utils/notify';

export function Payments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderApi.getOrders();
        setOrders(response.data || []);
      } catch {
        notifyError('Could not load payments', 'Tafadhali jaribu tena.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const startPayment = async (orderId: string) => {
    try {
      await paymentApi.initiatePayment(orderId);
      notifySuccess('Payment requested', 'Follow the M-Pesa prompt on your phone.');
    } catch (error: any) {
      notifyError('Payment failed', error?.response?.data?.message || 'Could not initiate payment.');
    }
  };

  const confirmDelivery = async (orderId: string) => {
    try {
      await paymentApi.confirmDelivery(orderId);
      notifySuccess('Delivery confirmed', 'Escrow can now be released.');
    } catch (error: any) {
      notifyError('Confirmation failed', error?.response?.data?.message || 'Could not confirm delivery.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-[#2B1612]">Payments</h1>
        <p className="mt-2 text-lg font-medium text-[#2B1612]/60">Track escrow, initiate M-Pesa prompts, and confirm delivery.</p>

        {loading ? (
          <div className="mt-8 rounded-[32px] border border-[#F4ECE1] bg-white p-10 text-center text-[#2B1612]/60">Loading payment data...</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:flex md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#008D41]"><ShieldCheck size={16} /> {order.status}</div>
                  <h2 className="mt-2 text-2xl font-black text-[#2B1612]">{order.listing?.cropName || 'Order'} x {order.quantity}</h2>
                  <p className="mt-1 text-[#2B1612]/60">{formatKES(order.totalPrice)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
                  <button onClick={() => startPayment(order.id)} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-3 font-black text-white"><CreditCard size={16} /> Pay</button>
                  <button onClick={() => confirmDelivery(order.id)} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#008D41]/10 px-5 py-3 font-black text-[#008D41]">Confirm delivery</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
