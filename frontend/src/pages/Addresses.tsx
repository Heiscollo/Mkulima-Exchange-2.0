import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export function Addresses() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      phone: '+254 712 345678',
      address: '123 Main Street',
      city: 'Nairobi',
      isDefault: true,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.address && newAddress.city) {
      const address: Address = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: false,
      };
      setAddresses([...addresses, address]);
      setNewAddress({ name: '', phone: '', address: '', city: '' });
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2.5 hover:bg-[#F4ECE1] rounded-xl transition-colors text-[#2B1612]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-black text-[#2B1612]">{t('profile.addresses')}</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-kenya text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Plus size={20} /> Add Address
          </button>
        </div>

        {/* Add Address Form */}
        {showForm && (
          <div className="rounded-[32px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-8 mb-8">
            <h2 className="text-xl font-bold text-[#2B1612] mb-6">New Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address name (e.g., Home, Office)"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#F4ECE1] focus:outline-none focus:border-[#008D41]"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#F4ECE1] focus:outline-none focus:border-[#008D41]"
              />
              <input
                type="text"
                placeholder="Street address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#F4ECE1] focus:outline-none focus:border-[#008D41]"
              />
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#F4ECE1] focus:outline-none focus:border-[#008D41]"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 px-4 py-3 bg-gradient-kenya text-white rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border-2 border-[#2B1612]/20 text-[#2B1612] rounded-xl font-bold hover:bg-[#F4ECE1] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-[24px] bg-white shadow-sm border-2 border-[#F4ECE1] p-6 hover:border-[#008D41] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={20} className="text-[#008D41]" />
                    <h3 className="text-lg font-bold text-[#2B1612]">{address.name}</h3>
                    {address.isDefault && (
                      <span className="px-3 py-1 bg-[#008D41]/10 text-[#008D41] text-xs font-bold rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#2B1612]/60">{address.address}</p>
                  <p className="text-sm text-[#2B1612]/60">{address.city}</p>
                  <p className="text-sm text-[#2B1612]/60">{address.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-2 text-xs font-bold text-[#008D41] bg-[#008D41]/10 rounded-lg hover:bg-[#008D41] hover:text-white transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
