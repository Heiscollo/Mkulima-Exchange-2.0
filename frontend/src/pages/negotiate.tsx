import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi, type Order } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatKES } from '../utils/marketplace';
import { notifyError, notifySuccess } from '../utils/notify';

export function Negotiate() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isFarmerOnOrder = Boolean(order && currentUser && order.farmerId === currentUser.id);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const response = await orderApi.getOrder(orderId);
        setOrder(response.data);
      } catch {
        notifyError('Could not load order', 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSendCounter = async () => {
    if (!orderId || !counterPrice) return;
    setSaving(true);
    try {
      if (isFarmerOnOrder) {
        await orderApi.sendCounterOffer(orderId, Number(counterPrice));
      } else {
        await orderApi.buyerSendCounter(orderId, Number(counterPrice));
      }
      notifySuccess('Counter offer sent', 'The other party will see your proposal.');
      navigate('/orders');
    } catch (error: any) {
      notifyError('Counter failed', error?.response?.data?.message || 'Unable to send counter offer.');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      if (isFarmerOnOrder) {
        await orderApi.acceptOrder(orderId);
      } else {
        await orderApi.acceptCounter(orderId);
      }
      notifySuccess('Accepted', 'Order updated successfully.');
      navigate('/orders');
    } catch (error: any) {
      notifyError('Could not accept', error?.response?.data?.message || 'Unable to accept.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      if (isFarmerOnOrder) {
        await orderApi.rejectOrder(orderId);
      } else {
        await orderApi.rejectCounter(orderId);
      }
      notifySuccess('Rejected', 'The order has been updated.');
      navigate('/orders');
    } catch (error: any) {
      notifyError('Could not reject', error?.response?.data?.message || 'Unable to reject.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#2B1612]/60">Loading negotiation...</div>;
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#2B1612]/60">Order not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex cursor-pointer items-center gap-2 font-bold text-[#2B1612] hover:text-[#008D41]"><ArrowLeft size={18} /> Back</button>
      <div className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#008D41]">Negotiation</p>
        <h1 className="mt-3 text-3xl font-black text-[#2B1612]">Order {order.id}</h1>
        <p className="mt-2 text-[#2B1612]/60">Current price: {formatKES(order.totalPrice)}</p>
        <div className="mt-6 rounded-[24px] bg-[#FDFBF7] p-4 text-sm text-[#2B1612]/70">
          <div><span className="font-bold">Status:</span> {order.status}</div>
          <div><span className="font-bold">Counter round:</span> {order.counterRound}</div>
          <div><span className="font-bold">Farmer:</span> {order.farmer?.name || 'N/A'}</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <label>
            <span className="mb-2 block text-sm font-bold text-[#2B1612]">Counter price per unit</span>
            <input value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} type="number" min="1" className="h-14 w-full rounded-2xl border-2 border-[#F4ECE1] bg-[#FDFBF7] px-4 outline-none" placeholder="Enter your offer" />
          </label>
          <button onClick={handleSendCounter} disabled={saving} className="self-end cursor-pointer rounded-2xl bg-gradient-kenya px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-70">
            <MessageSquare size={16} className="mr-2 inline" /> {isFarmerOnOrder ? 'Send counter offer' : 'Send counter'}
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleAccept} disabled={saving} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#008D41]/10 px-5 py-3 font-black text-[#008D41] disabled:opacity-70"><CheckCircle2 size={16} /> {isFarmerOnOrder ? 'Accept order' : 'Accept counter'}</button>
          <button onClick={handleReject} disabled={saving} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#E32636]/10 px-5 py-3 font-black text-[#E32636] disabled:opacity-70"><X size={16} /> {isFarmerOnOrder ? 'Reject order' : 'Reject counter'}</button>
        </div>
      </div>
    </div>
  );
}
