import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaTimes, FaEnvelope, FaSpinner } from 'react-icons/fa';
import Navbar from './Navbar';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch messages from the backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://balaguruva-final-hosting.onrender.com/api/contacts');
        setMessages(response.data);
        setFilteredMessages(response.data);
      } catch (err) {
        setError('Failed to fetch messages. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Search functionality
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = messages.filter(message =>
      message.name.toLowerCase().includes(lowercasedQuery) ||
      message.email.toLowerCase().includes(lowercasedQuery) ||
      message.subject.toLowerCase().includes(lowercasedQuery) ||
      message.message.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge styles
  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      case 'responded':
        return { backgroundColor: '#d1fae5', color: '#10b981' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#6b7280' };
    }
  };

  // Handle status update
  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await axios.put(`https://balaguruva-final-hosting.onrender.com/api/contacts/${messageId}`, { status: newStatus });
      setMessages(messages.map(msg =>
        msg._id === messageId ? { ...msg, status: newStatus } : msg
      ));
      setSelectedMessage(prev => prev && prev._id === messageId ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Memoized status options
  const statusOptions = useMemo(() => [
    { value: 'pending', label: 'Pending' },
    { value: 'responded', label: 'Responded' },
  ], []);

  // Message Details Modal Component
  const MessageDetailsModal = ({ message, onClose }) => {
    const [localStatus, setLocalStatus] = useState(message?.status || 'pending');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
      if (message) {
        setLocalStatus(message.status);
      }
    }, [message]);

    const handleStatusUpdate = async () => {
      if (localStatus === message.status) return;

      setUpdating(true);
      try {
        await handleStatusChange(message._id, localStatus);
      } finally {
        setUpdating(false);
      }
    };

    if (!message) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center text-gray-800">
              <FaEnvelope className="mr-2 text-indigo-500" /> Message Details
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="p-3 sm:p-5">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3">Message Information</h4>
              <p className="text-sm mb-2"><span className="font-semibold">Name:</span> {message.name}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Email:</span> {message.email}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Phone:</span> {message.phone || 'N/A'}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Subject:</span> {message.subject}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Message:</span></p>
              <p className="text-sm mb-4 p-3 bg-white rounded-md border border-gray-100">{message.message}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Received:</span> {formatDate(message.createdAt)}</p>
              
              <div className="mt-4">
                <p className="text-sm mb-2">
                  <span className="font-semibold">Status:</span> 
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={getStatusBadgeStyle(message.status)}>
                    {message.status}
                  </span>
                </p>
                
                <div className="mt-3">
                  <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status:
                  </label>
                  <div className="flex items-center">
                    <select 
                      id="status-update"
                      value={localStatus} 
                      onChange={(e) => setLocalStatus(e.target.value)}
                      disabled={updating}
                      className="flex-1 rounded-md border-gray-300 shadow-sm text-sm bg-white text-gray-900"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={handleStatusUpdate} 
                      disabled={updating || localStatus === message.status}
                      className={`ml-2 px-3 py-1.5 rounded text-sm font-medium ${
                        updating || localStatus === message.status 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                      } transition-all duration-200`}
                    >
                      {updating ? <FaSpinner className="inline animate-spin mr-1" /> : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-md text-gray-800 text-sm font-medium transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Messages</h2>
          
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Messages Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-6">{error}</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No messages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr key={message._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{message.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{message.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{message.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(message.createdAt)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={getStatusBadgeStyle(message.status)}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
};

export default MessagesPage;