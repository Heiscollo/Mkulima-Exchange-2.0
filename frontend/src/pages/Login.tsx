import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, MessageCircle, Phone } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { notifyError, notifySuccess } from '../utils/notify';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const presetPhone = useMemo(() => (location.state as { phone?: string } | null)?.phone || '', [location.state]);
  const [phone, setPhone] = useState(presetPhone);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(phone);
      notifySuccess('OTP sent', 'Check your phone for the verification code.');
      setStep('otp');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to send OTP.';
      setError(message);
      notifyError('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(phone, otp);
      const user = response?.user;
      if (user?.name === 'Pending' || !user?.isVerified) {
        navigate('/register', { state: { phone } });
        return;
      }
      notifySuccess('Karibu tena', 'Umeingia mafanikio.');
      navigate('/home');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to verify OTP.';
      setError(message);
      notifyError('Verification failed', message);
    } finally {
      setLoading(false);
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1612] via-[#2B1612]/30 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="text-4xl font-black leading-tight">Mkulima Exchange</h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">Ingia kwa OTP ya nambari yako. Hii hulinda wakulima na wanunuzi kwa uthibitisho wa haraka.</p>
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
            <h1 className="text-4xl font-black text-white lg:text-[#2B1612]">Karibu tena</h1>
            <p className="mt-2 text-white/80 lg:text-[#2B1612]/60">{step === 'phone' ? 'Weka nambari yako ili upokee OTP.' : 'Weka OTP uliyopewa.'}</p>
          </div>

          <GlassCard variant="light" className="rounded-[32px] border border-white/50 p-6 lg:border-[#F4ECE1] lg:bg-white lg:p-8">
            <form onSubmit={step === 'phone' ? sendOtp : verifyOtp} className="space-y-5">
              {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
              <div>
                <label className="mb-2 ml-1 block text-sm font-bold text-white lg:text-[#2B1612]">Phone number</label>
                <Input icon={<Phone size={18} />} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" required className="bg-white lg:bg-[#FDFBF7]" />
              </div>
              {step === 'otp' ? (
                <div>
                  <label className="mb-2 ml-1 block text-sm font-bold text-white lg:text-[#2B1612]">OTP</label>
                  <Input icon={<MessageCircle size={18} />} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" required className="bg-white lg:bg-[#FDFBF7]" />
                </div>
              ) : null}
              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-kenya px-5 py-4 text-base font-black text-white shadow-lg shadow-[#008D41]/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Please wait...' : step === 'phone' ? 'Send OTP' : 'Verify OTP'} {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            <div className="mt-6 text-center text-sm font-medium text-white/80 lg:text-[#2B1612]/60">
              New here?{' '}
              <Link to="/register" className="font-black text-[#A8E063] lg:text-[#008D41]">
                Complete registration
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
