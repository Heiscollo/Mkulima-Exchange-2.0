import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, MapPin, Phone, Tractor, User } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { CountySelect } from '../components/CountySelect';
import { useAuth } from '../contexts/AuthContext';
import { notifyError, notifySuccess } from '../utils/notify';

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, registerDetails } = useAuth();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('BUYER');
  const [county, setCounty] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { phone?: string } | null;
    const pendingPhone = localStorage.getItem('pending_phone') || '';

    setPhone(state?.phone || pendingPhone || currentUser?.phone || '');

    if (currentUser?.name && currentUser.name !== 'Pending') {
      setName(currentUser.name);
    }
    if (currentUser?.role === 'FARMER' || currentUser?.role === 'BUYER') {
      setRole(currentUser.role);
    }
    if (currentUser?.county) {
      setCounty(currentUser.county);
    }
    if (currentUser?.mpesaNumber) {
      setMpesaNumber(currentUser.mpesaNumber);
    } else if (pendingPhone || state?.phone || currentUser?.phone) {
      setMpesaNumber(pendingPhone || state?.phone || currentUser?.phone || '');
    }
  }, [currentUser, location.state]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      if (!phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!county) {
        throw new Error('County is required');
      }

      await registerDetails({
        phone: phone.trim(),
        name: name.trim(),
        role,
        county: county as any,
        mpesaNumber,
      });

      notifySuccess('Profile saved', 'Akaunti yako imewekwa kikamilifu.');
      navigate('/home');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to register. Please try again.';
      setError(message);
      notifyError('Registration failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FDFBF7]">
      <div className="hidden w-1/2 p-6 lg:block">
        <div className="relative h-full overflow-hidden rounded-[40px] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop"
            alt="Farm"
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#008D41] via-[#008D41]/30 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="text-4xl font-black leading-tight">Jiunge na soko la wakulima</h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">Weka majina, kaunti, na nambari ya M-Pesa ili profile yako iwe tayari kwa biashara salama.</p>
          </div>
        </div>
      </div>

      <div
        className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2 lg:px-8"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#2B1612]/70 lg:hidden" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-kenya text-white shadow-xl shadow-[#008D41]/30 lg:mx-0">
              <Leaf size={30} />
            </div>
            <h1 className="text-4xl font-black text-white lg:text-[#2B1612]">Complete your profile</h1>
            <p className="mt-2 text-white/80 lg:text-[#2B1612]/60">Tafadhali chagua nafasi yako na kaunti ili tuanze.</p>
          </div>

          <GlassCard variant="light" className="rounded-[32px] border border-white/50 p-6 lg:border-[#F4ECE1] lg:bg-white lg:p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
              <div className="rounded-2xl border border-[#F4ECE1] bg-[#FDFBF7] px-4 py-3 text-sm font-bold text-[#2B1612]">
                Verified phone: <span className="font-black text-[#008D41]">{phone || 'Not found'}</span>
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-white lg:text-[#2B1612]">Full name</label>
                <Input icon={<User size={18} />} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jina kamili" required className="bg-white lg:bg-[#FDFBF7]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('FARMER')} className={`rounded-2xl px-4 py-4 text-sm font-black ${role === 'FARMER' ? 'bg-gradient-kenya text-white' : 'border border-[#F4ECE1] bg-white text-[#2B1612]'}`}>
                  <div className="flex items-center justify-center gap-2"><Tractor size={16} /> FARMER</div>
                </button>
                <button type="button" onClick={() => setRole('BUYER')} className={`rounded-2xl px-4 py-4 text-sm font-black ${role === 'BUYER' ? 'bg-gradient-kenya text-white' : 'border border-[#F4ECE1] bg-white text-[#2B1612]'}`}>
                  <div className="flex items-center justify-center gap-2"><MapPin size={16} /> BUYER</div>
                </button>
              </div>
              <CountySelect value={county} onChange={(e) => setCounty(e.target.value)} className="bg-white" />
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-white lg:text-[#2B1612]">M-Pesa number</label>
                <Input icon={<Phone size={18} />} value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} placeholder="0712 345 678" className="bg-white lg:bg-[#FDFBF7]" />
              </div>
              <button disabled={isLoading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-4 text-base font-black text-white shadow-lg shadow-[#008D41]/30 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? 'Saving...' : 'Save profile'} {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
            <div className="mt-6 text-center text-sm font-medium text-white/80 lg:text-[#2B1612]/60">
              Already registered?{' '}
              <Link to="/login" className="font-black text-[#A8E063] lg:text-[#008D41]">
                Back to login
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
