import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function Orders() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const url = user?.role === 'farmer' ? '/api/orders/farmer' : '/api/orders/myorders';
        const { data } = await axios.get(url);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const mappedOrders = useMemo(() => {
    return orders.map(o => ({
      id: o._id,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString(),
      items: o.items?.map((item: any) => `${item.productId?.name || 'Item'} (${item.quantity})`).join(', ') || 'No Items',
      total: `KSh ${o.totalAmount}`,
      image: o.items?.[0]?.productId?.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop',
      farmer: o.farmerId?.name || 'Local Farm' 
    }));
  }, [orders]);

  const filteredOrders = mappedOrders.filter(order => 
    activeTab === 'active' ? (order.status !== 'delivered' && order.status !== 'cancelled') : (order.status === 'delivered' || order.status === 'cancelled')
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#2B1612] tracking-tight">{t('orders.pageTitle')}</h1>
          <p className="mt-2 text-[#2B1612]/60 font-medium text-lg">{t('orders.pageSubtitle')}</p>
          
          {/* Tabs */}
          <div className="mt-8 flex max-w-sm rounded-[20px] bg-[#F4ECE1] p-1.5 shadow-inner">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 rounded-[16px] py-3 text-sm font-bold transition-all ${
                activeTab === 'active' ? 'bg-white text-[#008D41] shadow-sm transform scale-[1.02]' : 'text-[#2B1612]/60 hover:text-[#2B1612]'
              }`}
            >
              {t('orders.active')}
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`flex-1 rounded-[16px] py-3 text-sm font-bold transition-all ${
                activeTab === 'past' ? 'bg-white text-[#008D41] shadow-sm transform scale-[1.02]' : 'text-[#2B1612]/60 hover:text-[#2B1612]'
              }`}
            >
              {t('orders.past')}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-[32px] bg-white shadow-sm border border-[#F4ECE1]">
              <div className="h-24 w-24 bg-[#F4ECE1] rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-[#008D41]/40" />
              </div>
              <h3 className="text-2xl font-black text-[#2B1612]">{t('orders.noOrders')}</h3>
              <p className="mt-2 text-[#2B1612]/60 font-medium">{t('orders.noOrdersDesc')}</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-[32px] bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-[#008D41]/10 border border-[#F4ECE1]"
              >
                <div className="flex flex-col sm:flex-row gap-6 p-6 md:p-8">
                  <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-[24px]">
                    <img 
                      src={order.image} 
                      alt={order.items} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-[#2B1612]/5" />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-[#E32636] uppercase tracking-wider">{order.farmer}</p>
                        <span className="text-sm font-bold text-[#2B1612]/50 bg-[#F4ECE1] px-3 py-1 rounded-lg">{order.id}</span>
                      </div>
                      <h4 className="mt-3 text-2xl font-black text-[#2B1612] line-clamp-1">{order.items}</h4>
                      <p className="mt-2 text-xl font-black text-[#008D41]">{order.total}</p>
                    </div>
                    
                    <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between border-t border-[#F4ECE1] pt-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          (order.status === 'shipped' || order.status === 'on_the_way') ? 'bg-[#FFD200]/20 text-[#F7971E]' : (order.status === 'delivered' ? 'bg-[#008D41]/10 text-[#008D41]' : 'bg-[#E32636]/10 text-[#E32636]')
                        }`}>
                          {(order.status === 'shipped' || order.status === 'on_the_way') ? (
                            <Truck size={20} />
                          ) : (
                            order.status === 'delivered' ? <CheckCircle2 size={20} /> : <Package size={20} />
                          )}
                        </div>
                        <div>
                          <span className={`block text-sm font-black uppercase tracking-wider ${
                            (order.status === 'shipped' || order.status === 'on_the_way') ? 'text-[#F7971E]' : (order.status === 'delivered' ? 'text-[#008D41]' : 'text-[#E32636]')
                          }`}>
                            {order.status}
                          </span>
                          <span className="block text-sm font-medium text-[#2B1612]/50 mt-0.5">{order.date}</span>
                        </div>
                      </div>

                      <button className="flex items-center justify-center gap-2 rounded-xl bg-[#F4ECE1] px-8 py-4 text-sm font-bold text-[#2B1612] transition-colors hover:bg-gradient-kenya hover:text-white">
                        {order.status === 'on_the_way' ? t('orders.track') : t('orders.reorder')}
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

