import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, ArrowRight, Leaf, MapPin } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

const KENYAN_COUNTIES = [
  'MOMBASA','KWALE','KILIFI','TANA_RIVER','LAMU','TAITA_TAVETA',
  'GARISSA','WAJIR','MANDERA','MARSABIT','ISIOLO','MERU',
  'THARAKA_NITHI','EMBU','KITUI','MACHAKOS','MAKUENI','NYANDARUA',
  'NYERI','KIRINYAGA','MURANGA','KIAMBU','TURKANA','WEST_POKOT',
  'SAMBURU','TRANS_NZOIA','UASIN_GISHU','ELGEYO_MARAKWET','NANDI',
  'BARINGO','LAIKIPIA','NAKURU','NAROK','KAJIADO','KERICHO',
  'BOMET','KAKAMEGA','VIHIGA','BUNGOMA','BUSIA','SIAYA',
  'KISUMU','HOMA_BAY','MIGORI','KISII','NYAMIRA','NAIROBI'
];

export function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('BUYER');
  const [county, setCounty] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!phone || !name || !county || !mpesaNumber) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.registerDetails({
        name,
        role,
        county: county as any,
        mpesaNumber,
        phone,
      } as any);

      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        login(response.user as any);
      }
      navigate('/home');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FDFBF7]">
      {/* Left Side - Image */}
      <div className="hidden w-1/2 lg:block relative p-6">
        <div className="h-full w-full relative overflow-hidden rounded-[40px] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop"
            alt="Farm"
            className="absolute inset-0 h-full w-full object-cover transform scale-105 -scale-x-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#008D41] via-[#008D41]/30 to-transparent opacity-90" />
          <div className="absolute bottom-16 left-16 right-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Jiunge na soko la wakulima
            </h2>
            <p className="mt-6 text-xl text-white/80 font-medium max-w-md">
              Weka majina, kaunti, na nambari ya M-Pesa ili profile yako iwe kamili
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 px-8 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-[#2B1612]/70 backdrop-blur-md lg:hidden" />
        <div className="hidden lg:block absolute inset-0 bg-pattern-kikoy opacity-30 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-10 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 mb-8 relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-kenya shadow-xl shadow-[#008D41]/30">
                <Leaf className="text-white absolute bottom-2 right-2 opacity-20" size={32} />
                <span className="text-4xl font-black text-white">M</span>
              </div>
              <h1 className="text-4xl font-black text-white lg:text-[#2B1612] tracking-tighter">
                Create Account
              </h1>
              <p className="mt-2 text-lg text-white/80 lg:text-[#2B1612]/60 font-medium">
                Join Mkulima Exchange today
              </p>
            </div>

            <GlassCard variant="light" className="lg:bg-white lg:shadow-xl lg:shadow-[#008D41]/5 lg:border-[#F4ECE1] p-8 rounded-[32px]">
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">
                    {error}
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-1.5 ml-2">
                    Phone number
                  </label>
                  <Input
                    type="tel"
                    placeholder="07XXXXXXXX"
                    icon={<Phone size={20} className="text-[#2B1612]/40" />}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="lg:bg-[#FDFBF7] lg:border-[#F4ECE1] text-[#2B1612]"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-1.5 ml-2">
                    Full name
                  </label>
                  <Input
                    type="text"
                    placeholder="Jina kamili"
                    icon={<User size={20} className="text-[#2B1612]/40" />}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="lg:bg-[#FDFBF7] lg:border-[#F4ECE1] text-[#2B1612]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-2 ml-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('FARMER')}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                        role === 'FARMER'
                          ? 'bg-[#008D41] text-white shadow-lg'
                          : 'bg-[#F4ECE1] text-[#2B1612]'
                      }`}
                    >
                      🌱 FARMER
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('BUYER')}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                        role === 'BUYER'
                          ? 'bg-[#008D41] text-white shadow-lg'
                          : 'bg-[#F4ECE1] text-[#2B1612]'
                      }`}
                    >
                      🛒 BUYER
                    </button>
                  </div>
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-1.5 ml-2">
                    County
                  </label>
                  <select
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#F4ECE1] bg-[#FDFBF7] px-4 py-3 text-[#2B1612] font-medium outline-none focus:border-[#008D41] transition-colors"
                  >
                    <option value="">Select county</option>
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* M-Pesa Number */}
                <div>
                  <label className="block text-sm font-bold text-white/90 lg:text-[#2B1612] mb-1.5 ml-2">
                    M-Pesa number
                  </label>
                  <Input
                    type="tel"
                    placeholder="0712 345 678"
                    icon={<Phone size={20} className="text-[#2B1612]/40" />}
                    required
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="lg:bg-[#FDFBF7] lg:border-[#F4ECE1] text-[#2B1612]"
                  />
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 mt-8 rounded-[16px] bg-gradient-kenya text-white font-bold text-lg shadow-lg shadow-[#008D41]/30 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                  {!isLoading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="mt-8 text-center text-base font-medium text-white/80 lg:text-[#2B1612]/60">
                Already have an account?{' '}
                <Link to="/login" className="font-black text-[#A8E063] lg:text-[#008D41] hover:underline">
                  Log in
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}