import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { notifyError } from '../utils/notify';
import { type AgriculturalCategory, type County } from '../constants/kenya';

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  county?: County | null;
  mpesaNumber?: string | null;
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface FarmerProfile {
  farmSizeAcres?: number | null;
  cropsGrown?: string[];
  county?: County | null;
}

export interface BuyerProfile {
  businessName?: string | null;
  businessType?: string | null;
}

export interface PublicUserProfile extends AuthUser {
  averageRating: number;
  completedTransactions: number;
  trustBadge: string;
  farmerProfile?: FarmerProfile | null;
  buyerProfile?: BuyerProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthMeResponse {
  success: boolean;
  user: AuthUser & { farmerProfile?: FarmerProfile | null; buyerProfile?: BuyerProfile | null };
}

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  phone: string;
  expiresIn: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterDetailsRequest {
  name: string;
  role: Exclude<UserRole, 'ADMIN'>;
  county: County;
  mpesaNumber?: string;
}

export interface RegisterDetailsResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface ListingFarmer {
  id: string;
  name: string;
  phone: string;
  county?: County | null;
  farmerProfile?: FarmerProfile | null;
}

export interface Listing {
  id: string;
  cropName: string;
  cropCategory: AgriculturalCategory;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  minimumOrderQuantity?: number | null;
  county: County;
  description?: string | null;
  availableDate: string;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  images: string[];
  farmer?: ListingFarmer;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingFilters {
  crop_name?: string;
  crop_category?: AgriculturalCategory | '';
  county?: County | '';
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export interface ListingsResponse {
  success: boolean;
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateListingRequest {
  crop_name: string;
  crop_category: AgriculturalCategory;
  quantity: number;
  unit: string;
  price_per_unit: number;
  county: County;
  available_date: string;
  description?: string;
  minimum_order_quantity?: number;
  images?: File[];
}

export interface OrderReview {
  id: string;
  reviewerId: string;
  reviewedId: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  reviewer?: AuthUser;
  reviewed?: AuthUser;
}

export interface Payment {
  id: string;
  orderId: string;
  mpesaTransactionId?: string | null;
  amount: number;
  status: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED';
  payerPhone: string;
  farmerPhone?: string | null;
  buyerConfirmed: boolean;
  farmerConfirmed: boolean;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: number;
  totalPrice: number;
  offeredPrice?: number | null;
  counterRound: number;
  expiresAt?: string | null;
  farmerConfirmed: boolean;
  buyerConfirmed: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PAID' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED';
  listing?: Listing;
  buyer?: AuthUser;
  farmer?: AuthUser;
  payment?: Payment | null;
  reviews?: OrderReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  listing_id: string;
  quantity: number;
  offered_price_per_unit?: number;
}

export interface CreateReviewRequest {
  order_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: OrderReview;
}

export interface UserReviewsResponse {
  success: boolean;
  message: string;
  data: {
    user: Pick<AuthUser, 'id' | 'name' | 'role'>;
    reviews: OrderReview[];
    averageRating: number;
    reviewCount: number;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: PublicUserProfile;
}

export interface UpdateProfileRequest {
  name?: string;
  county?: County;
  mpesaNumber?: string;
  farmSizeAcres?: number;
  cropsGrown?: string[];
  businessName?: string;
  businessType?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    payment?: Payment | null;
    order?: Order | null;
  };
}

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  data: {
    checkoutRequestId: string;
    merchantRequestId: string;
    paymentId: string;
    amount: number;
    status: 'PENDING';
  };
}

export interface PaymentConfirmResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    status: 'PAID' | 'COMPLETED';
    buyerConfirmed: boolean;
    farmerConfirmed: boolean;
  };
}

export interface AdminStats {
  totalFarmers: number;
  totalBuyers: number;
  totalActiveListings: number;
  totalOrders: number;
  totalCompletedOrders: number;
  totalValueTransactedKes: number;
  totalDisputedOrders: number;
  newUsersThisMonth: number;
}

export interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
}

export interface DisputedOrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  delete apiClient.defaults.headers.common.Authorization;
};

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      notifyError('Session expired', 'Please log in again.');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const request = async <T>(config: AxiosRequestConfig) => {
  const response = await apiClient.request<T>(config);
  return response.data;
};

export const authApi = {
  sendOtp: (payload: SendOtpRequest) => request<SendOtpResponse>({ method: 'POST', url: '/api/auth/send-otp', data: payload }),
  verifyOtp: (payload: VerifyOtpRequest) => request<VerifyOtpResponse>({ method: 'POST', url: '/api/auth/verify-otp', data: payload }),
  registerDetails: (payload: RegisterDetailsRequest) => request<RegisterDetailsResponse>({ method: 'POST', url: '/api/auth/register-details', data: payload }),
  me: () => request<AuthMeResponse>({ method: 'GET', url: '/api/auth/me' }),
};

export const listingApi = {
  getListings: (filters: ListingFilters = {}) => request<ListingsResponse>({ method: 'GET', url: '/api/listings', params: filters }),
  getListing: (id: string) => request<{ success: boolean; listing: Listing }>({ method: 'GET', url: `/api/listings/${id}` }),
  createListing: (payload: CreateListingRequest) => {
    const formData = new FormData();
    formData.append('crop_name', payload.crop_name);
    formData.append('crop_category', payload.crop_category);
    formData.append('quantity', String(payload.quantity));
    formData.append('unit', payload.unit);
    formData.append('price_per_unit', String(payload.price_per_unit));
    formData.append('county', payload.county);
    formData.append('available_date', payload.available_date);
    if (payload.description) formData.append('description', payload.description);
    if (payload.minimum_order_quantity !== undefined) formData.append('minimum_order_quantity', String(payload.minimum_order_quantity));
    payload.images?.forEach((file) => formData.append('images', file));
    return request<{ success: boolean; message: string; listing: Listing }>({
      method: 'POST',
      url: '/api/listings',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateListing: (id: string, payload: Partial<CreateListingRequest>) => request<{ success: boolean; message: string; listing: Listing }>({ method: 'PUT', url: `/api/listings/${id}`, data: payload }),
  deleteListing: (id: string) => request<{ success: boolean; message: string; listing: Listing }>({ method: 'DELETE', url: `/api/listings/${id}` }),
};

export const orderApi = {
  createOrder: (payload: CreateOrderRequest) => request<{ success: boolean; message: string; data: Order }>({ method: 'POST', url: '/api/orders', data: payload }),
  getOrders: (status?: string) => request<{ success: boolean; message: string; data: Order[] }>({ method: 'GET', url: '/api/orders', params: status ? { status } : undefined }),
  getOrder: (id: string) => request<{ success: boolean; message: string; data: Order }>({ method: 'GET', url: `/api/orders/${id}` }),
  acceptOrder: (id: string) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/accept` }),
  rejectOrder: (id: string, reason?: string) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/reject`, data: reason ? { reason } : {} }),
  sendCounterOffer: (id: string, counter_price_per_unit: number) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/counter`, data: { counter_price_per_unit } }),
  acceptCounter: (id: string) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/accept-counter` }),
  rejectCounter: (id: string) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/reject-counter` }),
  buyerSendCounter: (id: string, offered_price_per_unit: number) => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/orders/${id}/buyer-counter`, data: { offered_price_per_unit } }),
};

export const paymentApi = {
  initiatePayment: (orderId: string) => request<PaymentInitiateResponse>({ method: 'POST', url: `/api/payments/initiate/${orderId}` }),
  handleDarajaCallback: (payload: unknown) => request<{ success: boolean; message: string }>({ method: 'POST', url: '/api/payments/callback', data: payload }),
  confirmDelivery: (orderId: string) => request<PaymentConfirmResponse>({ method: 'PATCH', url: `/api/payments/confirm-delivery/${orderId}` }),
  getPaymentStatus: (orderId: string) => request<PaymentStatusResponse>({ method: 'GET', url: `/api/payments/${orderId}` }),
};

export const reviewApi = {
  createReview: (payload: CreateReviewRequest) => request<{ success: boolean; message: string; data: OrderReview }>({ method: 'POST', url: '/api/reviews', data: payload }),
  getUserReviews: (userId: string) => request<UserReviewsResponse>({ method: 'GET', url: `/api/users/${userId}/reviews` }),
  getUserProfile: (userId: string) => request<UserProfileResponse>({ method: 'GET', url: `/api/users/${userId}/profile` }),
  updateOwnProfile: (payload: UpdateProfileRequest) => request<{ success: boolean; message: string; data: AuthUser & { farmerProfile?: FarmerProfile | null; buyerProfile?: BuyerProfile | null } }>({ method: 'PUT', url: '/api/users/profile', data: payload }),
};

export const adminApi = {
  getDisputes: () => request<DisputedOrderResponse>({ method: 'GET', url: '/api/admin/disputes' }),
  resolveDisputedOrder: (id: string, resolution: 'COMPLETED' | 'REFUNDED') => request<{ success: boolean; message: string; data: Order }>({ method: 'PATCH', url: `/api/admin/orders/${id}/resolve`, data: { resolution } }),
  getStats: () => request<AdminStatsResponse>({ method: 'GET', url: '/api/admin/stats' }),
};

export const marketplaceApi = {
  auth: authApi,
  listings: listingApi,
  orders: orderApi,
  payments: paymentApi,
  reviews: reviewApi,
  admin: adminApi,
};

export { apiClient };
