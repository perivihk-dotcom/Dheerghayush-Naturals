import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OurStoryPage from './pages/OurStoryPage';
import ContactPage from './pages/ContactPage';

import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { UserProvider } from './context/UserContext';

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prevItems, product];
    });
    setShowCart(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <AdminProvider>
      <UserProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            
            {/* Public Routes */}
            <Route
              path="/*"
              element={
                <div className="App min-h-screen bg-gray-50 pb-16 md:pb-0">
                  <Header 
                    cartItems={cartItems} 
                    setShowCart={setShowCart} 
                    setShowAuth={setShowAuth}
                  />
                  
                  <Routes>
                    <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
                    <Route path="/products" element={<ProductsPage onAddToCart={addToCart} />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage onAddToCart={addToCart} />} />
                    <Route path="/our-story" element={<OurStoryPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    <Route path="/checkout" element={<CheckoutPage clearCart={clearCart} cartItems={cartItems} />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                  </Routes>
                  
                  <Footer />
                  
                  <CartSidebar 
                    isOpen={showCart} 
                    onClose={() => setShowCart(false)}
                    cartItems={cartItems}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                  
                  <AuthModal 
                    isOpen={showAuth} 
                    onClose={() => setShowAuth(false)} 
                  />
                  
                  <BottomNav setShowCart={setShowCart} cartItems={cartItems} />
                </div>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </AdminProvider>
  );
}

export default App;
