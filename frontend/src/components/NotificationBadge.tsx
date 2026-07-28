import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const POLL_INTERVAL_MS = 30000;

export function NotificationBadge() {
  const { isFarmer, isBuyer } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isFarmer && !isBuyer) return undefined;

    let cancelled = false;
    const targetStatus = isFarmer ? 'PENDING' : 'ACCEPTED';

    const fetchCount = async () => {
      try {
        const response = await orderApi.getOrders();
        if (cancelled) return;
        setCount(response.data.filter((order) => order.status === targetStatus).length);
      } catch {
        // Keep the last known count on a failed poll rather than flashing to 0.
      }
    };

    fetchCount();
    const intervalId = setInterval(fetchCount, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isFarmer, isBuyer]);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-[#E32636] px-1 text-[10px] font-black text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
