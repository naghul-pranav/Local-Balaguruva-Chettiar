import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaEdit,
  FaCamera, FaSave, FaTimes, FaPhone, FaMapMarkerAlt,
  FaExclamationTriangle, FaSpinner, FaKey, FaTrash, FaDownload,
  FaSignOutAlt, FaCheck, FaLock, FaShoppingBag, FaHeart
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);

  const navigate = useNavigate();
  const API_URL = "https://final-balaguruva-chettiar-ecommerce.onrender.com";

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = {
        ...response.data,
        city: response.data.city || "",
        postalCode: response.data.postalCode || "",
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
        lastLogin: response.data.lastLogin ? new Date(response.data.lastLogin) : new Date(),
        lastUpdated: response.data.lastUpdated ? new Date(response.data.lastUpdated) : null,
        preferences: response.data.preferences || {
          notifications: true,
          newsletter: false,
          darkMode: false
        }
      };

      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Session expired or invalid token. Please log in again.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => (window.location.href = "/login"), 3000);
      } else {
        setError("Unable to load user profile. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      setEditedUser(user);
      setProfileImage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const updatedData = {
        name: editedUser.name,
        phone: editedUser.phone,
        address: editedUser.address,
        city: editedUser.city,
        postalCode: editedUser.postalCode,
        preferences: editedUser.preferences,
        profileImage: profileImage || editedUser.profileImage
      };

      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setEditMode(false);
    } catch (error) {
      setError("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setProfileImage(e.target.result);
        setEditedUser(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitPasswordChange = async () => {
    setPasswordError("");
    if (!passwordData.current) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordData.new.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      await axios.put(
        `${API_URL}/api/user/password`,
        {
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
      setError({ type: "success", message: "Password updated successfully!" });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem('token');
    try {
      if (!deletePassword || !user?.email) {
        setDeleteError("Password and email are required.");
        return;
      }

      if (!token) {
        setDeleteError("No authentication token found. Please log in again.");
        localStorage.removeItem("user");
        setTimeout(() => (window.location.href = "/login"), 2000);
        return;
      }

      const verifyRes = await axios.post(`${API_URL}/api/user/verify-password`, {
        email: user.email,
        password: deletePassword,
      });

      if (!verifyRes.data.success) {
        setDeleteError("Incorrect password.");
        return;
      }

      await axios.delete(`${API_URL}/api/user/account`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      if (error.response?.status === 401) {
        setDeleteError(`${error.response?.data?.message || "Authentication failed"}. Please log in again.`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setDeleteError(error.response?.data?.message || "Account deletion failed.");
      }
    }
  };

  const exportUserData = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(
        `${API_URL}/api/user/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const PasswordChangeModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaKey className="mr-2 text-emerald-500" /> Change Password
        </h3>
        {passwordError && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
            {passwordError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="current"
              value={passwordData.current}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="new"
              value={passwordData.new}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirm"
              value={passwordData.confirm}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowPasswordModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submitPasswordChange}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteAccountModal = ({ deletePassword, setDeletePassword, onClose, onConfirm }) => {
    const inputRef = React.useRef(null);

    const handleInputChange = (e) => {
      setDeletePassword(e.target.value);
    };

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [deletePassword]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-red-700">
            <FaTrash className="mr-2" /> Delete Account
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700 mb-2">
              Please enter your password to confirm deletion:
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={handleInputChange}
              ref={inputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setDeletePassword("");
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!deletePassword}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                !deletePassword && "opacity-50 cursor-not-allowed"
              }`}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>
            <div className="bg-gradient-to-r from-emerald-600/90 to-amber-600/90 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 animate-pulse"></div>
              <div className="w-full">
                <div className="h-8 bg-white/20 rounded animate-pulse w-1/3 mb-4"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-1/2 mb-4"></div>
                <div className="h-6 bg-white/20 rounded animate-pulse w-1/4"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && typeof error === 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-700 max-w-md text-center">
          <FaExclamationTriangle className="text-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-700 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
          <p>Please log in to view your profile</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderProfileInfo = () => (
    <div className="text-center md:text-left flex-1">
      {editMode ? (
        <input
          type="text"
          name="name"
          value={editedUser.name}
          onChange={handleInputChange}
          className="text-3xl font-bold bg-transparent border-b border-white/30 text-white outline-none w-full md:w-auto text-center md:text-left"
        />
      ) : (
        <h1 className="text-3xl font-bold">{user.name}</h1>
      )}
      <p className="text-emerald-100 flex items-center justify-center md:justify-start mt-2">
        <FaEnvelope className="mr-2" />
        {user.email}
      </p>
      <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-4">
        <p className="text-sm">
          {user._id ? "Member" : "Local Profile"}
        </p>
        <button
          onClick={handleEditToggle}
          className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-full flex items-center transition-colors"
          aria-label={editMode ? "Cancel editing" : "Edit profile"}
          disabled={saving}
        >
          {editMode ? (
            <>
              <FaTimes className="mr-1" /> Cancel
            </>
          ) : (
            <>
              <FaEdit className="mr-1" /> Edit Profile
            </>
          )}
        </button>
        {editMode && (
          <button
            onClick={handleSaveChanges}
            className={`${
              saving ? "bg-emerald-400" : "bg-green-500 hover:bg-green-600"
            } text-white text-sm py-1 px-3 rounded-full flex items-center transition-colors`}
            aria-label="Save profile changes"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="mr-1 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-1" /> Save
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 font-['Inter','Roboto',sans-serif]">
      {showPasswordModal && <PasswordChangeModal />}
      {showDeleteModal && (
        <DeleteAccountModal
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletePassword("");
          }}
          onConfirm={handleDeleteAccount}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {error && error.type === "success" && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              <p className="text-sm text-green-700">{error.message}</p>
            </div>
            <button onClick={() => setError(null)}>
              <FaTimes className="text-green-500" />
            </button>
          </div>
        )}

        {error && error.type === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
            <button onClick={() => setError(null)}>
              <FaTimes className="text-red-500" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>

          <div className="bg-gradient-to-r from-emerald-600/90 to-amber-600/90 text-white p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl backdrop-blur-sm border-2 border-white/30 relative group overflow-hidden">
              {user.profileImage || profileImage ? (
                <img
                  src={profileImage || user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser />
              )}
              {editMode && (
                <label htmlFor="profile-image" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <FaCamera className="text-2xl" />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {renderProfileInfo()}
          </div>

          {error && typeof error === 'string' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button className="ml-auto" onClick={() => setError(null)}>
                  <FaTimes className="text-red-500" />
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
                  <FaShieldAlt className="mr-2 text-emerald-500" /> Account Security
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email verification</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={editedUser.phone || ""}
                        onChange={handleInputChange}
                        className="font-medium bg-transparent border-b border-gray-300 outline-none w-full"
                        placeholder="Add your phone number"
                      />
                    ) : (
                      <p className="font-medium flex items-center">
                        <FaPhone className="mr-2 text-emerald-500 text-xs" />
                        {user.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  {!user.googleId && (
                    <div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center text-emerald-600 hover:text-emerald-800 text-sm"
                      >
                        <FaKey className="mr-1" /> Change password
                      </button>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = "/login";
                      }}
                      className="flex items-center text-red-600 hover:text-red-800 text-sm mt-4"
                    >
                      <FaSignOutAlt className="mr-1" /> Logout
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
                  <FaCalendarAlt className="mr-2 text-emerald-500" /> Account Activity
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last login</span>
                    <span className="text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account created</span>
                    <span className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-2">Address</p>
                    {editMode ? (
                      <>
                        <textarea
                          name="address"
                          value={editedUser.address || ""}
                          onChange={handleInputChange}
                          className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                          rows={2}
                          placeholder="Add your address"
                        />
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">City</p>
                          <input
                            type="text"
                            name="city"
                            value={editedUser.city || ""}
                            onChange={handleInputChange}
                            className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Postal Code</p>
                          <input
                            type="text"
                            name="postalCode"
                            value={editedUser.postalCode || ""}
                            onChange={handleInputChange}
                            className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                            placeholder="Enter postal code"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium flex items-start">
                          <FaMapMarkerAlt className="mr-2 text-emerald-500 text-xs mt-1" />
                          {user.address || "Not provided"}
                        </p>
                        <div className="text-sm text-gray-600 mt-2">
                          <p><strong>City:</strong> {user.city || "Not provided"}</p>
                          <p><strong>Postal Code:</strong> {user.postalCode || "Not provided"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-t border-gray-100 pt-6 md:border-0 md:pt-0">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">Account Information</h3>
                <div className="bg-gradient-to-b from-white to-amber-50 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">User ID</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {user._id ? user._id.substring(0, 10) + "..." : "Not available"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Account created</span>
                      <span className="text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last profile update</span>
                      <span className="text-sm">
                        {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Login method</span>
                      <span className="text-sm">
                        {user.googleId ? "Google" : "Email & Password"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                <FaLock className="mr-2 text-emerald-500" /> Data Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                  <h4 className="font-medium text-emerald-800 mb-2">Download Your Data</h4>
                  <p className="text-sm text-emerald-600 mb-4">
                    Export all your personal data in a portable format.
                  </p>
                  <button
                    onClick={exportUserData}
                    disabled={exporting}
                    className={`flex items-center text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {exporting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" /> Exporting...
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-2" /> Download My Data
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaTrash className="mr-2" /> Delete My Account
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                <FaLock className="mr-2 text-emerald-500" /> Recent Activity
              </h3>
              <div className="bg-gradient-to-b from-white to-amber-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Your recent account activity will appear here</p>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                        <FaUser className="text-emerald-500 text-xs" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-gray-500">Your profile information was updated</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FaSignOutAlt className="text-green-500 text-xs" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last login</p>
                        <p className="text-xs text-gray-500">You logged in successfully</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <FaShoppingBag className="mr-2" /> My Orders
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaHeart className="mr-2" /> My Wishlist
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;