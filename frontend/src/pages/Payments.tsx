import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mpesa' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

export function Payments() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mpesa',
      name: 'M-Pesa',
      details: 'Linked to +254 712 345678',
      isDefault: true,
    },
  ]);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPayments(payments.map(p => ({
      ...p,
      isDefault: p.id === id,
    })));
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return '📱';
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      default:
        return '💰';
    }
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
            <h1 className="text-3xl font-black text-[#2B1612]">{t('profile.payments')}</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-kenya text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Plus size={20} /> Add Payment
          </button>
        </div>

        {/* Add Payment Form */}
        {showForm && (
          <div className="rounded-[32px] bg-white shadow-xl shadow-[#008D41]/5 border border-[#F4ECE1] p-8 mb-8">
            <h2 className="text-xl font-bold text-[#2B1612] mb-6">Add Payment Method</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 border-2 border-[#F4ECE1] rounded-xl hover:border-[#008D41] transition-colors text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-sm font-bold text-[#2B1612]">M-Pesa</p>
                </button>
                <button className="p-4 border-2 border-[#F4ECE1] rounded-xl hover:border-[#008D41] transition-colors text-center">
                  <div className="text-3xl mb-2">💳</div>
                  <p className="text-sm font-bold text-[#2B1612]">Card</p>
                </button>
                <button className="p-4 border-2 border-[#F4ECE1] rounded-xl hover:border-[#008D41] transition-colors text-center">
                  <div className="text-3xl mb-2">🏦</div>
                  <p className="text-sm font-bold text-[#2B1612]">Bank</p>
                </button>
              </div>
              <div className="flex gap-3">
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

        {/* Payment Methods */}
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-[24px] bg-white shadow-sm border-2 border-[#F4ECE1] p-6 hover:border-[#008D41] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">{getPaymentIcon(payment.type)}</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2B1612]">{payment.name}</h3>
                  <p className="text-sm text-[#2B1612]/60">{payment.details}</p>
                </div>
                {payment.isDefault && (
                  <span className="px-3 py-1 bg-[#008D41]/10 text-[#008D41] text-xs font-bold rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!payment.isDefault && (
                  <button
                    onClick={() => handleSetDefault(payment.id)}
                    className="px-3 py-2 text-xs font-bold text-[#008D41] bg-[#008D41]/10 rounded-lg hover:bg-[#008D41] hover:text-white transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
