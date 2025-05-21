import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ListChecks, ShoppingBag, Users, MessageSquare, // Add MessageSquare icon
  Menu, X, LogOut, UserCircle
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.profile-container')) setIsProfileOpen(false);
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('ksp_username');
    navigate('/login', { replace: true });
  };

  const closeMenuOnClick = () => {
    if (windowWidth <= 768) setIsMenuOpen(false);
  };

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'} mb-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                <pre>K.Balaguruva Chettiar Sons   </pre>   
              </span>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              className={`fixed md:relative top-0 left-0 bottom-0 w-full md:w-auto md:flex-1 bg-white dark:bg-gray-800 md:bg-transparent z-50 md:z-auto flex flex-col md:flex-row md:items-center transition-transform duration-300 ease-out ${
                isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              } md:visible md:opacity-100 overflow-y-auto md:overflow-visible h-full md:h-auto shadow-xl md:shadow-none`}
              style={{
                width: isMenuOpen ? '280px' : windowWidth > 768 ? 'auto' : '0',
                visibility: windowWidth <= 768 && !isMenuOpen ? 'hidden' : 'visible',
              }}
            >
              <ul className="flex flex-col md:flex-row md:space-x-4 lg:space-x-6 px-4 md:px-0 space-y-1 md:space-y-0 mt-4 md:mt-0">
                <li>
                  <Link to="/" onClick={closeMenuOnClick} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                    <Home className="w-5 h-5" /><span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/manage-products" onClick={closeMenuOnClick} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                    <ListChecks className="w-5 h-5" /><span>Manage Products</span>
                  </Link>
                </li>
                <li>
                  <Link to="/orders" onClick={closeMenuOnClick} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                    <ShoppingBag className="w-5 h-5" /><span>Orders</span>
                  </Link>
                </li>
                <li>
                  <Link to="/users" onClick={closeMenuOnClick} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                    <Users className="w-5 h-5" /><span>Users</span>
                  </Link>
                </li>
                <li>
                  <Link to="/messages" onClick={closeMenuOnClick} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                    <MessageSquare className="w-5 h-5" /><span>Messages</span>
                  </Link>
                </li>
              </ul>

              <div className="relative ml-auto px-4 py-3 profile-container">
                <button onClick={toggleProfile} className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <UserCircle className="w-6 h-6" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <LogOut className="inline w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;