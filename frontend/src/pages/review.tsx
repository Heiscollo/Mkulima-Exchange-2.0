import React, { useEffect, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi, reviewApi, type Order } from '../services/api';
import { notifyError, notifySuccess } from '../utils/notify';

export function ReviewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setSaving(true);
    try {
      await reviewApi.createReview({ order_id: orderId, rating, comment });
      notifySuccess('Review submitted', 'Thank you for sharing feedback.');
      navigate('/profile');
    } catch (error: any) {
      notifyError('Review failed', error?.response?.data?.message || 'Could not submit review.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#2B1612]/60">Loading review form...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex cursor-pointer items-center gap-2 font-bold text-[#2B1612] hover:text-[#008D41]"><ArrowLeft size={18} /> Back</button>
      <form onSubmit={handleSubmit} className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#008D41]">Review</p>
        <h1 className="mt-3 text-3xl font-black text-[#2B1612]">Rate your transaction</h1>
        <p className="mt-2 text-[#2B1612]/60">Order {order?.id || orderId}</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-[#2B1612]">Rating</span>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="h-14 w-full rounded-2xl border-2 border-[#F4ECE1] bg-[#FDFBF7] px-4 outline-none">
            {[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </label>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-[#2B1612]">Comment</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5} className="w-full rounded-[24px] border-2 border-[#F4ECE1] bg-[#FDFBF7] p-4 outline-none" placeholder="Share what went well..." />
        </label>
        <button disabled={saving} type="submit" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-70">
          <Send size={16} /> {saving ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}
