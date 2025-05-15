import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminHome from './components/admin_home';
import AddProduct from './components/AddProduct';
import ManageProducts from './components/ManageProducts';
import Login from './components/Login';
import User from './components/user';
import AdminOrdersPage from './components/order';
import ArchivedProducts from "./components/ArchivedProducts";
import MessagesPage from './components/MessagesPage'; // Import the new component
import ScrollToTop from './components/ScrollToTop';

const MAX_SESSION_TIME = 8 * 60 * 60 * 1000; // 8 hours

const checkAuth = () => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const loginTime = parseInt(sessionStorage.getItem('loginTime') || '0');
  const token = sessionStorage.getItem('token');
  const currentTime = new Date().getTime();

  if (!isAuthenticated || !loginTime || !token || (currentTime - loginTime > MAX_SESSION_TIME)) {
    sessionStorage.clear();
    return false;
  }

  return true;
};

const logout = (navigate) => {
  sessionStorage.clear();
  navigate('/login', { replace: true });
};

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!checkAuth()) {
      logout(navigate);
    }
  }, [navigate]);

  if (!checkAuth()) return null;
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="pt-20 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={checkAuth() ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<PrivateRoute><AdminHome /></PrivateRoute>} />
          <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
          <Route path="/manage-products" element={<PrivateRoute><ManageProducts /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><AdminOrdersPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><User /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/archived-products" element={<PrivateRoute><ArchivedProducts /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;