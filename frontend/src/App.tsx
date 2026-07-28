/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { Addresses } from './pages/Addresses';
import { Saved } from './pages/Saved';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { AddProduct } from './pages/AddProduct';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastHost } from './components/ToastHost';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ListingDetail } from './pages/listing-detail';
import { FarmerProfile } from './pages/FarmerProfile';
import { Negotiate } from './pages/negotiate';
import { FarmerDashboard } from './pages/farmer-dashboard';
import { BuyerDashboard } from './pages/buyer-dashboard';
import { ReviewPage } from './pages/review';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <ToastHost />
            <Routes>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                  <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
                </Route>

                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/farmer/:id" element={<FarmerProfile />} />
                <Route path="/negotiate/:orderId" element={<Negotiate />} />
                <Route path="/review/:orderId" element={<ReviewPage />} />
                <Route path="/add-product" element={<AddProduct />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
