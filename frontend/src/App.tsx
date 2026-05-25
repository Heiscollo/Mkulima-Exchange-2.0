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
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
            </Route>

            <Route path="/add-product" element={<AddProduct />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
