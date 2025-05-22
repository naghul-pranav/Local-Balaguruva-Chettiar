import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaList, FaUtensils, FaUsers, FaEnvelope,
  FaBars, FaTimes, FaSignOutAlt, FaUserCircle
} from 'react-icons/fa';

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

      <nav
        style={{ backgroundColor: '#0D9488' }}
        className={`fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'} mb-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group mr-10">
              <div className="p-1.5 rounded-lg bg-white text-teal-600">
                <FaUtensils className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">
                K.Balaguruva Chettiar Sons
              </span>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-white hover:text-amber-300"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>

            <div
              style={{ backgroundColor: '#0D9488' }}
              className={`fixed md:relative top-0 left-0 bottom-0 w-full md:w-auto md:flex-1 md:bg-transparent z-50 md:z-auto flex flex-col md:flex-row md:items-center transition-transform duration-300 ease-out ${
                isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              } md:visible md:opacity-100 overflow-y-auto md:overflow-visible h-full md:h-auto shadow-xl md:shadow-none`}
            >
              <ul className="flex flex-col md:flex-row md:space-x-4 lg:space-x-6 px-4 md:px-0 space-y-1 md:space-y-0 mt-4 md:mt-0">
                <li>
                  <Link
                    to="/"
                    onClick={closeMenuOnClick}
                    className={`flex items-center space-x-2 text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 ${
                      location.pathname === '/' ? 'bg-teal-700 text-amber-300' : 'text-white hover:bg-teal-700 hover:text-amber-300'
                    }`}
                  >
                    <FaHome className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manage-products"
                    onClick={closeMenuOnClick}
                    className={`flex items-center space-x-2 text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 ${
                      location.pathname === '/manage-products' ? 'bg-teal-700 text-amber-300' : 'text-white hover:bg-teal-700 hover:text-amber-300'
                    }`}
                  >
                    <FaList className="w-5 h-5" />
                    <span>Manage Products</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    onClick={closeMenuOnClick}
                    className={`flex items-center space-x-2 text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 ${
                      location.pathname === '/orders' ? 'bg-teal-700 text-amber-300' : 'text-white hover:bg-teal-700 hover:text-amber-300'
                    }`}
                  >
                    <FaUtensils className="w-5 h-5" />
                    <span>Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/users"
                    onClick={closeMenuOnClick}
                    className={`flex items-center space-x-2 text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 ${
                      location.pathname === '/users' ? 'bg-teal-700 text-amber-300' : 'text-white hover:bg-teal-700 hover:text-amber-300'
                    }`}
                  >
                    <FaUsers className="w-5 h-5" />
                    <span>Users</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    onClick={closeMenuOnClick}
                    className={`flex items-center space-x-2 text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 ${
                      location.pathname === '/messages' ? 'bg-teal-700 text-amber-300' : 'text-white hover:bg-teal-700 hover:text-amber-300'
                    }`}
                  >
                    <FaEnvelope className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                </li>
              </ul>

              <div className="relative ml-auto px-4 py-3 profile-container">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 text-sm font-medium text-white hover:text-amber-300 transition-colors duration-200"
                >
                  <FaUserCircle className="w-6 h-6" />
                </button>
                {isProfileOpen && (
                  <div
                    style={{ backgroundColor: '#0D9488' }}
                    className="absolute right-0 mt-2 w-48 bg-teal-700 rounded-lg shadow-lg ring-1 ring-white ring-opacity-20 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-amber-500 hover:text-teal-900 transition-colors duration-200"
                    >
                      <FaSignOutAlt className="inline w-4 h-4 mr-2" /> Logout
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