import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listingApi, orderApi, type Listing } from '../services/api';
import { formatKES } from '../utils/marketplace';
import { notifyError, notifySuccess } from '../utils/notify';

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await listingApi.getListing(id);
        setListing(response.listing);
      } catch {
        notifyError('Could not load listing', 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleOrder = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await orderApi.createOrder({ listing_id: id, quantity: Number(quantity) });
      notifySuccess('Order created', 'Your request has been sent to the farmer.');
      navigate('/orders');
    } catch (error: any) {
      notifyError('Order failed', error?.response?.data?.message || 'Could not create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[#2B1612]/60">Loading listing...</div>;
  }

  if (!listing) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[#2B1612]/60">Listing not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 font-bold text-[#2B1612] hover:text-[#008D41]">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[32px] border border-[#F4ECE1] bg-white shadow-sm">
          <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop'} alt={listing.cropName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#008D41]">{listing.cropCategory}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2B1612]">{listing.cropName}</h1>
          <p className="mt-3 text-[#2B1612]/70">{listing.description || 'No description provided.'}</p>
          <div className="mt-6 grid gap-3 rounded-[24px] bg-[#FDFBF7] p-4 text-sm text-[#2B1612]/70">
            <div><span className="font-bold">Price:</span> {formatKES(listing.pricePerUnit)} per {listing.unit}</div>
            <div><span className="font-bold">County:</span> {listing.county}</div>
            <div><span className="font-bold">Quantity:</span> {listing.quantity}</div>
            <div><span className="font-bold">Available:</span> {listing.availableDate}</div>
          </div>
          {listing.farmer ? (
            <div className="mt-4 flex items-center justify-between rounded-[24px] border border-[#F4ECE1] bg-[#FDFBF7] p-4">
              <p className="text-sm text-[#2B1612]/70"><span className="font-bold">Farmer:</span> {listing.farmer.name}</p>
              <Link to={`/farmer/${listing.farmer.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#008D41]/10 px-4 py-2 text-sm font-bold text-[#008D41] hover:bg-[#008D41]/20">
                <User size={16} /> View farmer profile
              </Link>
            </div>
          ) : null}
          <div className="mt-6 flex items-end gap-4">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-bold text-[#2B1612]">Quantity</span>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-[#F4ECE1] bg-[#FDFBF7] px-4 outline-none" />
            </label>
            <button onClick={handleOrder} disabled={submitting} className="inline-flex h-14 items-center gap-2 rounded-2xl bg-gradient-kenya px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-70">
              <ShoppingCart size={18} /> {submitting ? 'Ordering...' : 'Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
