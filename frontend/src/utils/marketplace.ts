export const formatKES = (value?: number | string | null) => {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0;
  return `KES ${Number(amount || 0).toLocaleString('en-KE')}`;
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const toLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const trustBadgeForTransactions = (role?: string, completedTransactions = 0) => {
  if (completedTransactions === 0) return 'New';
  if (completedTransactions < 5) return 'Verified';
  if (completedTransactions < 20) return 'Trusted';
  if (role === 'FARMER') return 'Top Seller';
  if (role === 'BUYER') return 'Top Buyer';
  return 'Trusted';
};
