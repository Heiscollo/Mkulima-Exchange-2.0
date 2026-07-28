import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CountySelect } from '../components/CountySelect';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { reviewApi } from '../services/api';
import { notifyError, notifySuccess } from '../utils/notify';

export function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [county, setCounty] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setBio((user as any)?.bio || '');
    setCounty(user?.county || '');
    setPhoneNumber(user?.mpesaNumber || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await reviewApi.updateOwnProfile({ 
        name, 
        county: county as any, 
        mpesaNumber: phoneNumber 
      });
      await refreshUser();
      notifySuccess('Profile updated', 'Your account information has been saved.');
      navigate('/profile');
    } catch (error: any) {
      notifyError('Could not save profile', error?.response?.data?.message || 'Try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-h-screen bg-[#FDFBF7] pb-24"
    >
      <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/profile')}
          className="mb-6 inline-flex items-center gap-2 font-bold text-[#2B1612] hover:text-[#008D41]"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="mb-8 text-4xl font-black tracking-tight text-[#2B1612]">
          Edit profile
        </h1>

        <div className="rounded-[32px] border border-[#F4ECE1] bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#FDFBF7]"
              />
            </div>

            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full rounded-[24px] border-2 border-[#F4ECE1] bg-[#FDFBF7] p-4 outline-none"
                placeholder="Tell buyers about your farm..."
              />
            </div>

            <CountySelect
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />

            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">
                M-Pesa number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07xxxxxxxx"
                className="bg-[#FDFBF7]"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#2B1612]/20 text-[#2B1612] font-bold hover:bg-[#F4ECE1] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-kenya text-white font-bold disabled:opacity-70 transition-all"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}